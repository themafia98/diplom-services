import React from 'react';
import { Avatar} from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
class StreamBox extends React.Component {
    render(){
        return (
            <Scrollbars
                    autoHeight
                    autoHeightMin={0}
                    autoHeightMax={'78vh'}
                >
                <div className = 'streamBox'>
                    <div className = 'cardStream'>
                        <p className = 'name'>Pavel Petrovich</p>
                        <Avatar shape="square" size="large" icon="user" />
                        <p className = 'card_message'>
                        Hello world!!! 
                        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                        </p>
                    </div>
                    <div className = 'cardStream'>
                        <p className = 'name'>Pavel Petrovich</p>
                        <Avatar shape="square" size="large" icon="user" />
                        <p className = 'card_message'>
                        Hello world!!! 
                        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                        Hello world!!! 
                        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                        Hello world!!! 
                        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                        Hello world!!! 
                        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                        </p>
                    </div>
                    <div className = 'cardStream'>
                    <p className = 'name'>Pavel Petrovich</p>
                    <Avatar shape="square" size="large" icon="user" />
                    <p className = 'card_message'>
                    Hello world!!! 
                    My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                    Hello world!!! 
                    My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                    Hello world!!! 
                    My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                    Hello world!!! 
                    My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                    </p>
                </div>
                <div className = 'cardStream'>
                <p className = 'name'>Pavel Petrovich</p>
                <Avatar shape="square" size="large" icon="user" />
                <p className = 'card_message'>
                Hello world!!! 
                My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                Hello world!!! 
                My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                Hello world!!! 
                My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                Hello world!!! 
                My name Pavel Petrovich and I'm Frontend developer. I looking for job.
                </p>
            </div>
                </div>
            </Scrollbars>
        )
    }
};

export default StreamBox;