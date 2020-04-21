// webRTC Data channel simple sample
var peer1 = new RTCPeerConnection();
var dc = pc.createDataChannel("peerChannel");

dc.onmessage = (event) => {
    console.log("received: " + event.data);
}

dc.onopen = () => {
    console.log("data channel opened")
}

dc.onclose = () => {
    console.log("data channel closed");
}