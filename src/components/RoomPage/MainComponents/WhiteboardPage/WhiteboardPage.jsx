import {useCallback, useContext, useEffect, useMemo, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {whiteboardCtx} from "../../../../store/whiteboardData.jsx";
import {whiteboardContext} from "../../../../service/sockets/WhiteboardSocket.jsx";
import {getWhiteboard} from "../../../../service/api/whiteboard.js";
import {changeColor, changeTool, clearLines} from "../../../../redux/whiteboardSlice/whiteboardSlice.js";
import {Skeleton} from "@mui/material";
import {BiPencil} from "react-icons/bi";
import {TfiMarkerAlt} from "react-icons/tfi";
import {BsEraser} from "react-icons/bs";
import {AiOutlineClear} from "react-icons/ai";

export const WhiteboardPage = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const classRoom = useSelector(state => state.classRoom.classRoom)
    const user = useSelector(state => state.auth.user)
    const whiteboard = useSelector(state => state.whiteboard.whiteboard);
    const whiteboardData = useContext(whiteboardCtx);
    const isDrawing = useRef(false);
    let previousPosition = useRef({x: 0, y: 0});
    const {
        sendWhiteboardToServer,
        sendClearToServer,
        sendLineToServer
    } = useContext(whiteboardContext)
    const dispatch = useDispatch();

    const colors = useMemo(
        () => ['black', 'red', 'green', 'blue', 'yellow', 'purple', 'orange', 'brown', 'pink', 'gray'],
        []
    );

    const isLecturer = useMemo(() => {
        if (classRoom === null || user === null) {
            return false;
        }
        return classRoom.lecturer.id === user.id;
    }, [classRoom, user]);

    const applyData = (data) => {
        const canvas = canvasRef.current;
        if (data) {
            const image = new Image();
            image.src = data;
            image.onload = function () {
                contextRef.current.drawImage(image, 0, 0);
            };
        } else {
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    useEffect(() => {
        if (whiteboardData.current === null && classRoom !== null) {
            getWhiteboard({roomId: classRoom.id}).then(res => {
                whiteboardData.current = res.data;
                applyData(whiteboardData.current);
            }).catch(err => {
                console.log(err);
            })
        }
        const canvas = canvasRef.current;
        contextRef.current = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        applyData(whiteboardData.current);
        return () => {
            whiteboardData.current = canvas.toDataURL();
        }
    }, [classRoom, isLecturer, whiteboardData]);

    useEffect(() => {
        const sendData = () => {
            if (!isLecturer || canvasRef.current === null) {
                return;
            }
            const newData = canvasRef.current.toDataURL();
            sendWhiteboardToServer(newData)
        }
        const intervalId = setInterval(sendData, 1000);
        return () => {
            clearInterval(intervalId);
        }
    }, [isLecturer, sendWhiteboardToServer]);

    useEffect(() => {
        if ((whiteboard.pendingLines.length === 0) || isLecturer) {
            return;
        }
        const drawLine = (x0, y0, x1, y1, color, lineWidth) => {
            contextRef.current.beginPath()
            contextRef.current.moveTo(x0, y0)
            contextRef.current.lineTo(x1, y1)
            contextRef.current.lineWidth = lineWidth
            contextRef.current.strokeStyle = color
            contextRef.current.stroke()
        }

        for (let i = 0; i < whiteboard.pendingLines.length; i++) {
            const line = whiteboard.pendingLines[i];
            if (line.clear) {
                contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                continue;
            }
            drawLine(line.x0, line.y0, line.x1, line.y1, line.color, line.lineWidth);
        }
        dispatch(clearLines());
    }, [dispatch, isLecturer, whiteboard.pendingLines]);

    useEffect(() => {
        const canvas = canvasRef.current;

        const startDrawing = (event) => {
            previousPosition.current = {x: event.offsetX, y: event.offsetY};
            isDrawing.current = true;
        }

        const stopDrawing = () => {
            previousPosition.current = {x: 0, y: 0};
            isDrawing.current = false;
        }

        const drawLine = (x0, y0, x1, y1, color, lineWidth) => {
            contextRef.current.beginPath()
            contextRef.current.moveTo(x0, y0)
            contextRef.current.lineTo(x1, y1)
            contextRef.current.lineWidth = lineWidth
            contextRef.current.strokeStyle = color
            contextRef.current.stroke()
            sendLineToServer({
                x0: x0,
                y0: y0,
                x1: x1,
                y1: y1,
                color: color,
                lineWidth: lineWidth
            })
        }

        const draw = (event) => {
            if (isDrawing.current) {
                let line = null;
                switch (whiteboard.tool.toLowerCase()) {
                    case 'pencil':
                        line = {
                            x1: previousPosition.current.x,
                            y1: previousPosition.current.y,
                            x2: event.offsetX,
                            y2: event.offsetY,
                            color: whiteboard.color,
                            width: 2
                        }

                        break;
                    case 'marker':
                        line = {
                            x1: previousPosition.current.x,
                            y1: previousPosition.current.y,
                            x2: event.offsetX,
                            y2: event.offsetY,
                            color: whiteboard.color,
                            width: 10
                        }
                        break;
                    case 'eraser':
                        line = {
                            x1: previousPosition.current.x,
                            y1: previousPosition.current.y,
                            x2: event.offsetX,
                            y2: event.offsetY,
                            color: 'white',
                            width: 20
                        }
                        break;
                    default:
                        break;
                }
                drawLine(line.x1, line.y1, line.x2, line.y2, line.color, line.width)
                previousPosition.current = {x: event.offsetX, y: event.offsetY};
            }
        }

        const throttle = (callback, delay) => {
            let previousCall = new Date().getTime();
            return function () {
                const time = new Date().getTime();
                if ((time - previousCall) >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
            };
        }

        if (!isLecturer) {
            return;
        }

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        canvas.addEventListener('mousemove', throttle(draw, 10));
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchend', stopDrawing);
        canvas.addEventListener('touchcancel', stopDrawing);
        canvas.addEventListener('touchmove', throttle(draw, 10));

        return () => {
            console.log('remove event listener')
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);
            canvas.removeEventListener('mousemove', throttle(draw, 10));
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchend', stopDrawing);
            canvas.removeEventListener('touchcancel', stopDrawing);
            canvas.removeEventListener('touchmove', throttle(draw, 10));
        }
    }, [isLecturer, sendLineToServer, whiteboard])

    const clearCanvas = useCallback(() => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        sendClearToServer();
    }, [sendClearToServer]);

    const {firstCol, secondCol} = useMemo(() => {
        const firstCol = [
            <button
                key={'pencil'}
                className={`h-10 w-10 p-2.5 xl:p-2.5 rounded active:bg-accent-color-one dark:active:bg-dark-accent-color-one ${
                    whiteboard.tool === 'pencil' ? ' bg-accent-color-one dark:bg-dark-accent-color-one' : ''
                }`}
                onClick={() => dispatch(changeTool('pencil'))}
            >
                <BiPencil className={'text-black dark:text-white'}/>
            </button>,
            <button
                key={'marker'}
                className={`h-10 w-10 p-2.5 xl:p-2.5 rounded active:bg-accent-color-one dark:active:bg-dark-accent-color-one ${
                    whiteboard.tool === 'marker' ? ' bg-accent-color-one dark:bg-dark-accent-color-one' : ''
                }`}
                onClick={() => dispatch(changeTool('marker'))}
            >
                <TfiMarkerAlt className={'text-black dark:text-white'}/>
            </button>,
            <button
                key={'eraser'}
                className={`h-10 w-10 p-2.5 xl:p-2.5 rounded active:bg-accent-color-one dark:active:bg-dark-accent-color-one${
                    whiteboard.tool === 'eraser' ? ' bg-accent-color-one dark:bg-dark-accent-color-one' : ''
                }`}
                onClick={() => dispatch(changeTool('eraser'))}
            >
                <BsEraser className={'text-black dark:text-white'}/>
            </button>];
        const secondCol = [];
        colors.map((color, index) => {
            const element = <button
                key={`color-${color}-${index}`}
                className={`h-10 w-10 p-2.5 xl:p-2.5 rounded active:bg-accent-color-one dark:active:bg-dark-accent-color-one${
                    (whiteboard.color === color && whiteboard.tool !== 'eraser') ?
                        ' bg-accent-color-one dark:bg-dark-accent-color-one' : ''
                }`}
                onClick={() => dispatch(changeColor(color))}
            >
                <div className={'h-[15px] w-full border border-gray-600'}
                     style={{backgroundColor: color}}/>
            </button>
            if (firstCol.length < 7) {
                firstCol.push(element)
            } else {
                secondCol.push(element)
            }
        })
        secondCol.push(<button
            key={'clear-canvas'}
            className={'p-2.5 rounded active:bg-accent-color-one dark:active:bg-dark-accent-color-one'}
            onClick={clearCanvas}
        >
            <AiOutlineClear className={'text-black dark:text-white'}/>
        </button>)
        return {firstCol, secondCol}
    }, [clearCanvas, colors, dispatch, whiteboard]);

    if (!classRoom) {
        return <Skeleton variant="rounded" width={'100%'} height={'100%'}/>
    }

    return (
        <div className={'h-full w-full flex flex-row gap-2'}>
            {
                isLecturer && (
                    <div className={'h-full flex flex-row md:flex-col gap-2 md:gap-0'}>
                        <div className={'bg-secondary dark:bg-dark-secondary shadow rounded md:rounded-b-[0px] h-full flex flex-col justify-between'}>
                            {firstCol.map(element => element)}
                        </div>
                        <div className={'bg-secondary dark:bg-dark-secondary shadow rounded md:rounded-t-[0px] h-full flex flex-col justify-between'}>
                            {secondCol.map(element => element)}
                        </div>
                    </div>
                )
            }
            <div className={'flex-1 bg-secondary dark:bg-dark-secondary p-2 rounded shadow'}>
                <canvas id={'canvas'} className={'w-full h-full rounded-sm'} ref={canvasRef}
                        style={{backgroundColor: 'white'}}/>
            </div>
        </div>
    )
}