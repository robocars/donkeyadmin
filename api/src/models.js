const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('config');
const {promisify} = require('util');
const multer = require('multer');
const PythonShell = require('python-shell');

const model_upload = multer({ storage: multer.diskStorage({
        destination: config.get('models.root'),
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    }) 
})

const readdir = promisify(fs.readdir);

const router = express.Router();

let pyshell = null;
let options = {};

router.get('/models', async (req, res) => {
    const root = config.get('models.root');
    res.json((await readdir(root)).map((dir) => ({
        name: dir,
        url: `/models/${dir}`,
        $links: {
            drive: {
                $url: `/models/${dir}/drive`,
                $method: 'POST'
            },
            stop: {
                $url: `/models/${dir}/stop`,
                $method: 'POST'
            }
        }    
    })));
});

router.post('/models', model_upload.single('model'), async (req, res) => {
    res.json({
        status: 'OK'
    })
});

router.post('/models/:id/drive', async (req, res) => {
    if (pyshell) {
        return res.status(400).json({
            message: 'Already running, stop first'
        });
    }
    //
    pyshell = new PythonShell('manage.py', {
        scriptPath: config.get('car.path'),
        args: ['drive', '--model', path.join(config.get('models.root'), req.params.id)]
    });
    res.json({
        status: 'LAUNCHING'
    });
    pyshell.on('message', (message) => {
        options.io && options.io.emit('drive', {
            type: 'message',
            message
        });
    });
    pyshell.on('close', () => {
        options.io && options.io.emit('drive', {
            type: 'close',
            message: 'Closed by python'
        });
        pyshell = null;
    });
    pyshell.on('error', (err) => {
        options.io && options.io.emit('drive', {
            type: 'error',
            message: err.message
        });
    });
});

router.post('/models/:id/stop', async (req, res) => {
    if (pyshell) {
        await pyshell.end();
        pyshell = null;
    }
    res.json({
        status: 'STOPPED'
    });
});

router.setup = (opt) => {
    options = Object.assign(options, opt);
}
    
module.exports = router;