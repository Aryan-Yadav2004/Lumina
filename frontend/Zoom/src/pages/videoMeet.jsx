import React, { useEffect, useRef, useState } from 'react'
import "../styles/videoComponent.css"
import TextField from '@mui/material/TextField';
import io from "socket.io-client";
import Button from '@mui/material/Button';
import { connection } from 'mongoose';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import MicOffIcon from '@mui/icons-material/MicOff';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ChatIcon from '@mui/icons-material/Chat';
import Badge from '@mui/material/Badge';
import { useNavigate } from 'react-router-dom';
import server from '../enviroment';
const server_url = server;

const connections = {};

const peerconfigConnnections = {
    "iceServers": [
      {"urls": "stun:stun.l.google.com:19302"} //STUN servers are lightweight servers running on the public internet which return the IP address of the requester's device.
    ]
}

function VideoMeet() {

    let navigate = useNavigate();
    var socketRef = useRef();

    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvaiable] = useState(true);

    let [audioAvailable, setAudioAvaiable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState([]);

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState();

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");
 
    const videoRef = useRef([]);
     
    let[videos, setVideos] = useState([]);
    //TODO
    // if(isChrome() == false){

    // }
    const getPermissions = async () => {
      try{
        const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});

        if(videoPermission) {
          setVideoAvaiable(true);
        } else{
          setVideoAvaiable(false); 
        }

        const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});

        if(audioPermission) {
          setAudioAvaiable(true);
        } else{
          setAudioAvaiable(false); 
        }

        if(navigator.mediaDevices.getDisplayMedia){
          setScreenAvailable(true);
        }
        else{
          setScreenAvailable(false);
        }

        if(videoAvailable || audioAvailable){
          const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});

          if(userMediaStream){
            window.localStream = userMediaStream;
            if(localVideoRef.current){
              localVideoRef.current.srcObject = userMediaStream;
            }
          }
        }

      } catch (err) {
        console.log(err); 
      }
    };

    useEffect(()=>{
      console.log("HELLO")
      getPermissions();
    },[]);

    let getUserMediaSucess = (stream) => {
      try{
        console.log(window.localStream)
        window.localStream?.getTracks().forEach(track => track.stop());
      } catch(e) {console.log(e)}

      window.localStream = stream;
      localVideoRef.current.srcObject = stream;

      for(let id in connections){
        if(id === socketIdRef.current) continue;
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description)=>{
          console.log(description);
          connections[id].setLocalDescription(description).then(()=>{
            socketRef.current.emit("signal",id,JSON.stringify({"sdp": connections[id].localDescription}))
          })
          .catch(e => console.log(e))
        })
      }
      stream.getTracks().forEach(track => track.onended = () => {
        setVideo(false);
        setAudio(false); 
        try{
          let tracks = localVideoRef.current.srcObject.getTracks()
          tracks.forEach(track => track.stop())
        } catch (e) {console.log(e)}

        let blackSlience = (...args) => new MediaStream([black(...args), silence()])
        window.localStream = blackSlience();
        localVideoRef.current.srcObject = window.localStream;

        for(let id in connections){
          connections[id].addStream(window.localStream)
          connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description)
            .then(()=>{
              socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
            }).catch(e => console.log(e))
          })
        }
      })
    }

    let silence = () => {
      let ctx = new AudioContext()
      let oscillator = ctx.createOscillator();
      let dst = oscillator.connect(ctx.createMediaStreamDestination());

      oscillator.start();
      ctx.resume();
      return Object.assign(dst.stream.getAudioTracks()[0],{ enabled: false})
    }

    let black = ({width = 640, height = 480} = {}) =>{
      let canvas = Object.assign(document.createElement("canvas"), {width,height});

      canvas.getContext('2d').fillRect(0, 0, width, height);
      let stream = canvas.captureStream();
      return Object.assign(stream.getVideoTracks()[0],{ enabled: false});
    }

    let getUserMedia = () => {
      if((video && videoAvailable) || (audio && audioAvailable)){
        navigator.mediaDevices.getUserMedia({video: video, audio: audio})
        .then(getUserMediaSucess) //TODO: getUserMediaSucess
        .then((stream)=>{})
        .catch((e) => console.log(e));
      }
      else{
        try{
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        } catch(e){
          console.log(e);
        }
      }
    }

    useEffect(() => {
      if(video !== undefined && audio !== undefined){
        getUserMedia();
      }
    },[audio,video]);

    let gotMessageFromServer = (fromId, message) => {
      var signal = JSON.parse(message)
      if(fromId !== socketIdRef.current){
        if(signal.sdp){
          connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
            if(signal.sdp.type === "offer"){
              connections[fromId].createAnswer().then((description) => {
                connections[fromId].setLocalDescription(description).then(()=>{
                  socketRef.current.emit("signal",fromId,JSON.stringify({"sdp":connections[fromId].localDescription}));
                }).catch(e => console.log(e));
              }).catch(e => console.log(e));
            }
          }).catch(e=>console.log(e));
        }
        
        if(signal.ice){
          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
        }
      }
    }
    //TODO add Message
    let addMessage = (data, sender, socketIdSender) => {
      setMessages((prevMessages) => [...prevMessages,{sender: sender, data: data}]);
      if(socketIdSender !== socketIdRef.current){
        setNewMessages((prevMessages)=> prevMessages + 1);
      }
    }
    let connectToSocketServer = () => {
      socketRef.current = io.connect(server_url,{secure: false});

      socketRef.current.on('signal', gotMessageFromServer);

      socketRef.current.on('connect',() => {
        socketRef.current.emit("join-call",window.location.href);
        socketIdRef.current = socketRef.current.id;
        socketRef.current.on ("chat-message",addMessage);
        socketRef.current.on("user-left",(id)=>{
          console.log(videos)
          setVideos((videos)=>videos.filter((video)=>video.socketId !== id));
          
        });
        console.log(videos)
        socketRef.current.on("user-joined",(id,clients)=>{
          clients.forEach((socketListId)=>{
            connections[socketListId] = new RTCPeerConnection(peerconfigConnnections)
            connections[socketListId].onicecandidate = (event) => {
              if(event.candidate){
                socketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}))
              }
            }
            connections[socketListId].onaddstream = (event) => {
              let videoExists = videoRef.current.find(video => video.socketId === socketListId);
              if(videoExists){
                setVideos(videos => {
                  const updatedVideos = videos.map(video=>
                    video.socketId === socketListId ? {...video,stream: event.stream} : video
                  );
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                });
              }
              else{
                let newVideo = {
                  socketId:  socketListId,
                  stream : event.stream,
                  autoplay: true,
                  playsinline: true,
                }
                setVideos(videos => {
                  const updatedVideos = [...videos,newVideo];
                  videoRef.current = updatedVideos;
                  return updatedVideos; 
                });
                console.log(videos)
              }
            };
            if(window.localStream !== undefined && window.localStream !== null){
              connections[socketListId].addStream(window.localStream);
            }
            else{
              //TODO blackSlience
              //let blackSlience

              let blackSlience = (...args) => new MediaStream([black(...args), silence()])
              window.localStream = blackSlience();
              connections[socketListId].addStream(window.localStream);
            }
          });
          if(id === socketIdRef.current){
            for(let id2 in connections){
              if(id2 === socketIdRef.current) continue
              try{
                connections[id2].addStream(window.localStream);
              }
              catch (e) {

              }
              connections[id2].createOffer().then((description)=>{
                connections[id2].setLocalDescription(description)
                .then(()=>{
                  socketRef.current.emit("signal", id2, JSON.stringify({"sdp": connections[id2].localDescription}))//for handshaking
                })
                .catch(e => console.log(e)) 
              });
            }
          }
        })
      });
    }

    let getMedia = () => {
      setVideo(videoAvailable);
      setAudio(audioAvailable);
      connectToSocketServer();
    }

    let connect =  ()=>{
      setAskForUsername(false);
      getMedia();
    }
    let handleVideo = () => {
      setVideo(!video);
    }
    let handleAudio = () => {
      setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) => {
      try{
        window.localStream.getTracks().forEach(track => track.stop());
      } catch(e) {console.log(e)}

      window.localStream = stream;
      localVideoRef.current.srcObject = stream;

      for(let id in connections){
        if(id === socketIdRef.current) continue;

        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description)=>{
          connections[id].setLocalDescription(description)
          .then(()=>{
            socketRef.current.emit("signal",id,JSON.stringify({"sdp": connections[id].localDescription}))
          })
          .catch(e => console.log(e));
        })

      }
      stream.getTracks().forEach(track => track.onended = () => {
        setScreen(false);
        try{
          let tracks = localVideoRef.current.srcObject.getTracks()
          tracks.forEach(track => track.stop())
        } catch (e) {console.log(e)}

        let blackSlience = (...args) => new MediaStream([black(...args), silence()])
        window.localStream = blackSlience();
        localVideoRef.current.srcObject = window.localStream;

        getUserMedia();
      })
    }

    let getDisplayMedia = () => {
      if(screen){
        if(navigator.mediaDevices.getDisplayMedia){
          navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
          .then(getDisplayMediaSuccess)
          .then((stream)=>{})
          .catch(e=>{console.log(e)});
        }
      }
    }
    useEffect(()=>{
      if(screen !== undefined){
        getDisplayMedia();
      }
    },[screen])
    let handleScreen = () => {
      setScreen(!screen);
    }
    let sendMessage = () => {
      if(message.trim() === "") return;
      socketRef.current.emit("chat-message",message,username);
      setMessage("");
    }
    let handleChat = () => {
      setModal(!showModal);
      setNewMessages(0);
    }
    let handleEndCall = () => {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      catch(e){
        console.log(e);
      }
      navigate("/home");
    }
  return (
    <div>
        {askForUsername == true ?
        <div className='MeetEntryPoint'>
          <div style={{position:"relative",background:"url(/logo2.svg)",backgroundRepeat:"no-repeat", objectFit:"contain",backgroundPosition:"center"}}>
            <h2 style={{left:"0",top:"0",position:"absolute",backgroundColor:"white",paddingLeft:"3.8rem",paddingRight:"3.8rem",paddingTop:"1rem",paddingBottom:"1rem", borderRadius:"10px"}}>Enter into the lobby</h2>
            <div style={{display:"flex", background:"white",borderRadius:"10px"}}>
              <TextField id='outlined-basic' label="Username" value={username} onChange={e => setUsername(e.target.value)} ></TextField>
              <Button variant="contained" onClick={connect}>Connect</Button>
            </div>
          </div>
          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div> : 
         <div className='meetVideoContainer'>

          <div className="buttonContainer">
            <IconButton style={{color: "white"}} onClick={handleVideo}>
              {(video == true) ? <VideocamIcon />: <VideocamOffIcon/>}
            </IconButton>
            <IconButton style={{color: "white"}} onClick={handleAudio}>
              {(audio == true) ? <MicIcon />: <MicOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{color: "red"}}>
              <CallEndIcon/>
            </IconButton>
            {screenAvailable? 
              <IconButton style={{color: "white"}} onClick={handleScreen}>
                {(screen == true) ? <ScreenShareIcon />: <StopScreenShareIcon />}
              </IconButton>
              :
              <></>
            }
            <Badge badgeContent={(showModal? 0:newMessages)} max={999} color='secondary'>
              <IconButton onClick={handleChat} style={{color: "white"}}>
                <ChatIcon/>
              </IconButton>
            </Badge>
          </div>

          <video className='meetUserVideo' ref={localVideoRef} autoPlay></video>
            {showModal?
              <div className="chatRoom">
                <div className="chatContainer">
                  <h1>Chat</h1>
                  <div className='chattingDisplay'>
                    {messages.length > 0 ? messages.map((item,index)=>{
                      return(
                        (username === item.sender) ?
                        <div key={index} style={{marginBottom: "20px", background:"#a2fcba", padding: "1rem", borderRadius: "1rem", textAlign: "right"}}>
                          <p><i>{item.data}</i></p>
                        </div>
                        :
                        <div key={index} style={{marginBottom: "20px", background:"#d7dbd8",padding: "1rem", borderRadius: "1rem"}}>
                          <p style={{fontWeight:"bold"}}>{item.sender}</p>
                          <p><i>{item.data}</i></p>
                        </div>
                      )
                    })
                    :
                    <p>No messages yet!</p>}
                    <div style={{background:"transparent", height:"20px"}}>

                    </div>
                  </div>
                  <div className="chattingArea">
                    <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="fullWidth" label="Enter your msg" variant="outlined" />
                    <Button variant='contained'  onClick={sendMessage}>Send</Button>
                  </div> 
                </div>
              </div>
              :
              <></>
            }
          <div className='conferenceView'>
          {videos.map(video => (
            
              <video key={video.socketId} data-socket = {video.stream } ref={ref => { if(ref && video.stream){ref.srcObject = video.stream;}}}  autoPlay/>
            
          ))}
          </div>
         </div>
        }
    </div>
  )
}

export default VideoMeet;