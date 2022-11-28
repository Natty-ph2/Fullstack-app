import { 
    ButtonGroup,
    Box,
    IconButton,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderTrack,
    RangeSliderThumb,
    Center,
    Flex,
    Text
} from "@chakra-ui/react";
import ReactHowler from 'react-howler';
import { useEffect, useRef, useState } from "react";
import { 
    MdShuffle,
    MdSkipPrevious,
    MdSkipNext,
    MdOutlinePlayCircleFilled,
    MdOutlinePauseCircleFilled,
    MdOutlineRepeat,
 } from "react-icons/md";
 import { useStoreActions } from "easy-peasy";
import { stat } from "fs/promises";
import { formatTime } from "../lib/formatters";



const Player = ({ songs, activeSong }) => {

    const [playing, setPlaying] = useState(true)
    const [index, setIndex] = useState(
        songs.findIndex((s) => s.id === activeSong.id)
    )
    const [seek, setSeek] = useState(0.0)
    const [isSeeking, setIsSeeking] = useState(false)
    const [repeat, setRepeat] = useState(false)
    const [shuffle, setShuffle] = useState(false)
    const [duration, setDuration] = useState(0.0)
    const repeatRef = useRef(repeat)
    const soundRef = useRef(null)
    const setActiveSong = useStoreActions((state:any) => state.changeActiveSong)


    useEffect(() => {
        let timeID

        if(playing && !isSeeking) {
            const f = () => {
                setSeek(soundRef.current.seek())
                timeID = requestAnimationFrame(f)
            }
            timeID = requestAnimationFrame(f)
            return() => cancelAnimationFrame(timeID)
        }
        cancelAnimationFrame(timeID)
    },[playing, isSeeking])

    useEffect(() => {
        setActiveSong(songs[index])
    }, [index, setActiveSong, songs])

    useEffect(() => {
        repeatRef.current = repeat

    }, [repeat])

    const setPlayeState = (value) => {
       setPlaying(value)
    }

    const onShuffle = () => {
        setShuffle((state) => !state)
    }

    const onRepeat = () => {
        setRepeat((state) => !state)
    }

    const prevSong = () => {
        setIndex((state) => {
            return state ? state - 1 : songs.length - 1
        })
    }

    const nextSong = () => {
        setIndex((state) => {
            if(shuffle) {
                const next = Math.floor(Math.random() * songs.length)

                if(next === state) {
                    return nextSong()
                }

                return next

            }
                return state === songs.length -1 ? 0 : state + 1
            
        })
    }

    const onEnd = () => {
        if(repeatRef.current) {
            console.log('should repeat')
            setSeek(0)
            soundRef.current.seek(0)
        } else {
            console.log('why u not repeating')
            return nextSong()
        }
    }

    const onLoad = () => {
        const songDuration = soundRef.current.duration()
        setDuration(songDuration)

    }

    const onSeek = (e) => {
       setSeek(parseFloat(e[0]))
       soundRef.current.seek(e[0])
    }
    
    return (
        <Box>
            <Box>
                <ReactHowler  playing={playing} 
                              src={activeSong?.url} 
                              ref={soundRef}
                              onEnd={onEnd}
                              onLoad={onLoad}
                             />
            </Box>
            <Center color="gray.600">
                <ButtonGroup>
                    <IconButton 
                        outline="none"
                        variant="link" 
                        aria-label="shuffle" 
                        fontSize="24px"
                        icon={<MdShuffle />}
                        color={shuffle ? 'white' : 'gray.600'}
                        onClick={onShuffle}
                     />
                     <IconButton 
                        outline="none"
                        variant="link" 
                        aria-label="skip" 
                        fontSize="24px"
                        icon={<MdSkipPrevious />}
                        onClick={prevSong}
                     />

                     {playing? (
                        <IconButton 
                        outline="none"
                        variant="link" 
                        aria-label="pause" 
                        fontSize="40px"
                        color="white"
                        icon={<MdOutlinePauseCircleFilled />}
                        onClick={() => setPlayeState(false)}
                        />
                     ): (
                        <IconButton 
                        outline="none"
                        variant="link" 
                        aria-label="play" 
                        fontSize="40px"
                        color="white"
                        icon={<MdOutlinePlayCircleFilled />}
                        onClick={() => setPlayeState(true)}
                     />
                     )}
                   
                     
                     
                     <IconButton 
                        outline="none"
                        variant="link" 
                        aria-label="next" 
                        fontSize="24px"
                        icon={<MdSkipNext />}
                        onClick={nextSong}
                     />
                     <IconButton 
                        outline="none"
                        variant="link" 
                        aria-label="repeat" 
                        fontSize="24px"
                        icon={<MdOutlineRepeat />}
                        color={repeat ? 'white' : 'gray.600'}
                        onClick={onRepeat}
                     />
                </ButtonGroup>
            </Center>
            <Box color="gray.600">
                <Flex justify="center" align="center">
                    <Box width="10%">
                        <Text fontSize="xs">{formatTime(seek)}</Text>
                    </Box>
                    <Box width="80%">
                        <RangeSlider 
                            aria-label={['min', 'max']}
                            step={0.1}
                            min={0}
                            id="player-range"
                            max={duration ? (duration.toFixed(2) as unknown as number) : 0}
                            onChange={onSeek}
                            value={[seek]}
                            onChangeStart={() => setIsSeeking(true)}
                            onChangeEnd={() => setIsSeeking(false)}

                        >
                            <RangeSliderTrack bg="gray.800">
                                <RangeSliderFilledTrack bg="gray.600"/>
                            </RangeSliderTrack>
                            <RangeSliderThumb index={0}/>
                        </RangeSlider>    
                    </Box>
                    <Box width="10%" textAlign="right">
                        <Text fontSize="xs" >{formatTime(duration)}</Text>
                    </Box>
                </Flex>
            </Box>
        </Box>
    )
 }

 export default Player