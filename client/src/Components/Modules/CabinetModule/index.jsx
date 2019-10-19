import React from 'react';
import UserCard from '../../UserCard';
import TitleModule from '../../TitleModule';
import StreamBox from '../../StreamBox';

class CabinetModule extends React.Component {
    render(){
        return(
            <div className = 'cabinetModule'>
                <TitleModule 
                    additional = 'Профиль' 
                    classNameTitle = 'cabinetModuleTitle' 
                    title = 'Личный кабинет' 
                />
                <div className = 'cabinetModule_main'>
                    <div className = 'col-6'>
                        <UserCard />
                    </div>
                    <div className = 'col-6'>
                        <p className = 'lastActivity'>Последняя активность</p>
                        <StreamBox boxClassName = 'streamActivityCabinet' mode = 'activity' />
                    </div>
                </div>
            </div>
        )
    }
};

export default CabinetModule;