import {useDispatch, useSelector} from "react-redux";
import {useContext, useMemo} from "react";
import {BsCameraVideo, BsCameraVideoOff} from "react-icons/bs";
import {IoMicOffOutline, IoMicOutline} from "react-icons/io5";
import {changeAudioPermission, changeVideoPermission} from "../../../../redux/classRoomSlice/classRoomSlice.js";
import {imageBaseURL} from "../../../../service/api/apiConfiguration.js";
import {classRoomSocketContext} from "../../../../service/sockets/ClassRoomSocket.jsx";

export const SideBarParticipants = () => {
    const classRoom = useSelector(state => state.classRoom.classRoom);
    const user = useSelector(state => state.auth.user);
    const dispatcher = useDispatch();
    const {changePermission} = useContext(classRoomSocketContext);

    const [lecturer, students, isLecturer] = useMemo(() => {
        if (!classRoom) {
            return [{}, [], false]
        } else {
            let students = classRoom.students;
            const studentsForSort = [...students]
            studentsForSort.sort((a, b) => {
                if (a.isActive === b.isActive) {
                    return 0;
                }
                if (a.isActive) {
                    return -1;
                }
                return 1;
            })
            students = studentsForSort;
            return [classRoom.lecturer, students, classRoom.lecturer.id === user.id]
        }
    }, [classRoom, user]);

    const handleAudioButton = (userId, value) => {
        if (!isLecturer) return;
        changePermission({
            userId,
            permission: {
                audio: value
            }
        })
        dispatcher(changeAudioPermission({userId, value}))
    }

    const handleVideoButton = (userId, value) => {
        if (!isLecturer) return;
        changePermission({
            userId,
            permission: {
                video: value
            }
        })
        dispatcher(changeVideoPermission({userId, value}))
    }

    return (
        <div className={'gap-4 p-3 flex flex-col h-full'}>
            <div className={'gap-2 h-min flex flex-col'}>
                <h2 className={'font-semibold border-b-2'}>Lecturer</h2>
                <div className={'flex flex-row gap-2 items-center'}>
                    {
                        isLecturer && <>
                            <button
                                className={'rounded p-1 bg-primary cursor-not-allowed'}>
                                {
                                    lecturer.settings.video.enabled ? <BsCameraVideo/> : <BsCameraVideoOff/>
                                }
                            </button>
                            <button
                                className={'rounded p-1 bg-primary cursor-not-allowed'}>
                                {
                                    lecturer.settings.audio.enabled ? <IoMicOutline/> : <IoMicOffOutline/>
                                }
                            </button>
                            {/*<button*/}
                            {/*    className={'rounded p-1 bg-primary'}>*/}
                            {/*    {*/}
                            {/*            lecturer.settings.screenShare ? <LuScreenShare/> : <LuScreenShareOff/>*/}
                            {/*    }*/}
                            {/*</button>*/}
                        </>
                    }

                    <img
                        src={`${imageBaseURL}${lecturer.profilePicture}`}
                        alt={''}
                        className={'object-cover w-8 h-8 rounded-full'}/>
                    <span className={'font-normal'}>{lecturer.name}</span>
                </div>
            </div>
            <div className={'gap-2 flex flex-col h-[calc(100%-89px)] w-full'}>
                <h2 className={'font-semibold border-b-2'}>Students <span>({students.length})</span></h2>
                <div className={'overflow-y-scroll'}>
                    <ul className={'h-min gap-2 flex flex-col'}>
                        {students.map((student, index) => {
                            return <li
                                className={'flex flex-row gap-2 justify-between items-center'}
                                key={index}
                            >
                                <div className={'flex flex-row gap-2 items-center'}>
                                    {
                                        isLecturer && <>
                                            <button
                                                className={
                                                    `rounded p-1${
                                                        student.settings.video.permission ?
                                                            ' bg-primary' : ' bg-dangerColor'
                                                    }`}
                                                onClick={
                                                    () => handleVideoButton(
                                                        student.id,
                                                        !student.settings.video.permission
                                                    )
                                                }
                                            >
                                                {
                                                    student.settings.video.permission ?
                                                        (student.settings.video.enabled ? <BsCameraVideo/> :
                                                            <BsCameraVideoOff/>) :
                                                        <BsCameraVideoOff color={'white'}/>
                                                }
                                            </button>
                                            <button
                                                className={`rounded p-1${
                                                    student.settings.audio.permission ?
                                                        ' bg-primary' : ' bg-dangerColor'
                                                }`
                                                }
                                                onClick={() => handleAudioButton(
                                                    student.id,
                                                    !student.settings.audio.permission
                                                )}
                                            >
                                                {
                                                    student.settings.audio.permission ?
                                                        (student.settings.audio.enabled ? <IoMicOutline/> :
                                                            <IoMicOffOutline/>) :
                                                        <IoMicOffOutline color={'white'}/>
                                                }
                                            </button>
                                            {/*<button*/}
                                            {/*    className={'rounded p-1' + (student.settings.screenShare.permission ? ' bg-primary' : ' bg-dangerColor')}>*/}
                                            {/*    {*/}
                                            {/*        student.settings.screenShare.permission ?*/}
                                            {/*            (student.settings.screenShare.enabled ? <LuScreenShare/> : <LuScreenShareOff/>) :*/}
                                            {/*            <LuScreenShareOff/>*/}
                                            {/*    }*/}
                                            {/*</button>*/}
                                        </>
                                    }
                                    <img
                                        src={`${imageBaseURL}${student.profilePicture}`}
                                        alt={''}
                                        className={'object-cover w-8 h-8 rounded-full'}
                                    />
                                    <span className={'font-normal'}>{student.name}</span>
                                </div>
                                <div
                                    className={`w-[7px] h-[7px] rounded-full${
                                        student.isActive ? 
                                            ' bg-green-500' : ' bg-red-500'
                                    }`}
                                />
                            </li>
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}