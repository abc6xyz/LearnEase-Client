import LogoBanner from '../../../assets/logo/logo-banner.png'
import {InputField} from "../../UtilityComponents/InputFields/InputField.jsx";
import {homePageButton} from "../../styles.js";
import {useEffect, useState} from "react";
import {NavBar} from "../NavBar/NavBar.jsx";

export const HomeBody = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const room = {
            id: 123441234,
            name: 'Mathematics',
            date: new Date(),
        }
        const totalHistory = [...Array(100)].map(() => room);
        setHistory(totalHistory);

    }, []);

    return (
        <div className={'w-screen h-screen bg-primary flex flex-col'}>
            <NavBar/>
            <main className={'flex flex-col md:flex-row justify-between flex-1'}>
                <div className={'h-full w-full flex justify-center items-center'}>
                    <div className={'w-1/2 flex flex-col gap-9'}>
                        <div className={''}>
                            <img src={LogoBanner} alt={'logo'}/>
                        </div>
                        <div className={'w-full flex flex-col gap-2.5'}>
                            <div className={'w-full flex flex-row gap-2.5'}>
                                <InputField type={'text'} placeholder={'Enter room id'}/>
                                <button className={homePageButton}>Join</button>
                            </div>
                            <div>
                                <button className={homePageButton + ' w-full'}>Create Room</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={'h-full w-full flex justify-center items-center'}>
                    <div className={'w-1/2 max-h-full bg-white flex flex-col shadow rounded-md p-3.5'}>
                        <h3 className={'font-semibold border-b pb-2 mb-2'}>History</h3>
                        <div
                            className={'flex flex-col gap-2.5 flex-1 overflow-y-auto'}
                            style={{maxHeight: 'calc(100vh - 200px)'}}
                        >
                            {
                                history.length ? history.map((room, index) => (
                                    <div key={index} className={'flex justify-between'}>
                                        <div>{room.name}</div>
                                        <div className={'flex flex-row gap-1.5'}>
                                            <span>{room.date.toLocaleDateString()}</span>
                                            <span className={'text-logo-green cursor-pointer'}>View</span>
                                        </div>
                                    </div>
                                )) : <div className={'text-center italic'}>No history</div>
                            }
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}