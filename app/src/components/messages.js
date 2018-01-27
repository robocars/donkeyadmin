import React, { Component } from 'react';

class MessageBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }
    render() {
        return (
            <div>
                <h1>Messages</h1>
                <div style={{ 'text-align': 'left' }}>
                    {this.state.messages.map((message) => {
                        if (typeof message === 'object') {
                            let color = 'black';
                            switch(message.type) {
                                case 'close':
                                case 'error':
                                    color = 'red';
                                    break;
                                case 'message':
                                    color = 'blue';
                                    break;
                                default:
                                    break;
                            }
                            return <div style={{ color }}>{message.message}</div>
                        } else return <div>{message}</div>
                    })}
                </div>
            </div>
        )
    }
}

export default MessageBox;