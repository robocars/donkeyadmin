import React, { Component } from 'react';
import { getModels, executeLink } from '../api/models.api';
import io from 'socket.io-client';

class Models extends Component {
    constructor(props) {
        super(props);
        this.state = {
            models: [],
            apiBaseUrl: '',
            filename: 'Choose file'
        }
    }
    socket = null;
    async loadModels(baseUrl) {
        const models = await getModels(baseUrl, this.props.onMessage);
        this.setState({
            models,
            apiBaseUrl: baseUrl || ''
        });
    }
    setupSocket(apiBaseUrl) {
        if (this.socket) this.socket.close();
        this.socket = io(apiBaseUrl || `${window.location.protocol}//${window.location.host}`);
        this.socket.on('drive', (message) => {
            this.props.onMessage({
                type: message.type,
                message: `${new Date().toISOString()} - DRIVE - ${message.type} - ${message.message}`
            });
        });
    }
    async componentWillMount() {
        await this.loadModels(this.props.apiBaseUrl);
        this.setupSocket(this.props.apiBaseUrl);
    }
    componentWillUnmount() {
        if (this.socket) this.socket.close();
        this.socket = null;
    }
    async componentWillReceiveProps(nextProps) {
        if (nextProps.apiBaseUrl !== this.props.apiBaseUrl) {
            await this.loadModels(nextProps.apiBaseUrl);
            this.setupSocket(nextProps.apiBaseUrl);
        }
    }
    onFileChange() {
        const self = this;
        return (e) => {
            self.setState({
                filename: e.target.value
            })
        }
    }
    executeModelLink(link) {
        const self = this;
        return (e) => {
            executeLink(self.state.apiBaseUrl, link, self.props.onMessage);
        }
    }
    render() {
        return (
            <div>
                <h1>Models</h1>
                <form action={`${this.state.apiBaseUrl || ''}/models`} method="post" encType="multipart/form-data" target="_blank">
                    <div className="input-group mb-3">
                        <div className="custom-file">
                            <input type="file" className="custom-file-input" id="inputGroupFile02" name="model" onChange={this.onFileChange()}/>
                            <label className="custom-file-label">{this.state.filename}</label>
                        </div>
                        <div className="input-group-append">
                        <input type="submit" value="Upload" className="input-group-text"/>
                        </div>
                    </div>                   
                    
                </form>
                <ul className="list-group">
                {(this.state.models || []).map((model, idx) => {
                    return <li className="list-group-item" key={idx}>
                    <div className="row">
                        <div className="col-md-8"><span>{model.name}</span></div>
                        <div className="col-md-2"><button type="button" className="btn btn-outline-primary" onClick={this.executeModelLink(model.$links.drive)}>Drive</button></div>
                        <div className="col-md-2"><button type="button" className="btn btn-outline-primary" onClick={this.executeModelLink(model.$links.stop)}>Stop</button></div>
                        </div>
                    </li>
                })}
                </ul>
            </div>
        )
    }
}

export default Models;