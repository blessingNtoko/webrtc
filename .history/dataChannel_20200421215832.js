(() => {
    // Defining global variables to be used
    let connectBtn = null;
    let disconnectBtn = null;
    let sendBtn = null;
    let msgInputBox = null;
    let receiveBox = null;

    let localConnect = null; // RTCPeerConnection for our "local" connection
    let remoteConnect = null; // RTCPeerConnection for the "remote"


    let sendChannel = null; // RTCDataChannel for the local (sender)
    let receiveChannel = null; // RTCDataChannel for the remote (receiver)



    function startUp() {
        console.log("Starting Up");
        // Creating constants with references to buttons and input boxes
        connectBtn = document.getElementById('connectBtn');
        disconnectBtn = document.getElementById('disconnectBtn');
        sendBtn = document.getElementById('sendBtn');
        msgInputBox = document.getElementById('message');
        receiveBox = document.getElementById('receiveBox');

        // Adding event listeners on buttons for connecting, disconnecting, and send a message
        connectBtn.addEventListener('click', connectPeers, false);
        disconnectBtn.addEventListener('click', disconnectPeers, false);
        sendBtn.addEventListener('click', sendMessage, false);
    }

    function connectPeers() {
        try {
            console.log("Connecting peers");
            // Create local peer connection
            localConnect = new RTCPeerConnection();

            // Create data channel on local peer connection
            sendChannel = localConnect.createDataChannel("sendChannel");
            console.log("sendChannel ->", sendChannel);
            // Adding event listeners to monitor if channel is open or closed
            sendChannel.onopen = handleSendChannelStatusChange;
            sendChannel.onclose = handleSendChannelStatusChange;

            // Create remote peer connection
            remoteConnect = new RTCPeerConnection();
            console.log("remoteConnect ->", remoteConnect);
            // Use RTCDataChannel object of remote peer to listen for data channel connection from local
            remoteConnect.ondatachannel = receiveChannelCallback;

            // Setting up ICE  candidates for both peers
            try {
                localConnect.onicecandidate = (e) => !e.candidate || remoteConnect.addIceCandidate(e.candidate).catch(handleAddCandidateError);

                remoteConnect.onicecandidate = (e) => !e.candidate || localConnect.addIceCandidate(e.candidate).catch(handleAddCandidateError);
            } catch (error) {
                console.warn("Error with ice candidates ->", error);
            }

            // Create connection offer to send to remote peer
            console.log("Creating connection offer");
            try {

                localConnect.createOffer().then((offer) => {
                    localConnect.setLocalDescription(offer);
                    console.log("offer ->", offer);
                }).then(() => {
                    remoteConnect.setRemoteDescription(localConnect.localDescription);
                    console.log("localConnect.localDescription ->", localConnect.localDescription);
                }).then(() => {
                    remoteConnect.createAnswer()
                        .then((answer) => {
                            remoteConnect.setLocalDescription(answer);
                            console.log("answer ->", answer);
                        }).then(() => {
                            localConnect.setRemoteDescription(remoteConnect.localDescription);
                            console.log("remoteConnect.localDescription ->", remoteConnect.localDescription);
                        }).catch(handleCreateDescriptionError);
                }).catch(handleCreateDescriptionError);
            } catch (error) {
                console.warn("Error when creating offer and answer ->", error);
            }
        } catch (error) {
            console.warn("Error when connecting peers ->", error);
        }
    }

    // handle error when creating description.
    // can happen when creating offer and answer.
    // handled the same here
    function handleCreateDescriptionError(error) {
        console.log('Unable to create offer/answer: ' + error.toString());
    }

    function handleAddCandidateError() {
        console.log("Failed to add ice candidate");
    }

    // handle receiving data channel object
    function receiveChannelCallback(event) {
        try {
            receiveChannel = event.channel;

            receiveChannel.onmessage = handleReceiveMessage;
            receiveChannel.onopen = handleReceiveChannelStatusChange;
            receiveChannel.onclose = handleReceiveChannelStatusChange;
        } catch (error) {
            console.warn("Error on receiveChannelCallback ->", error);
        }
    }

    // handle channel status change
    function handleSendChannelStatusChange(event) {
        try {
            console.log("handleSendChannelStatusChange event->", event);

            if (sendChannel) {
                console.log("send channel", sendChannel);
                var state = sendChannel.readyState;

                // UI changes when state is open or closed
                if (state === "open") {
                    msgInputBox.disabled = false;
                    msgInputBox.focus();
                    sendBtn.disabled = false;
                    disconnectBtn.disabled = false;
                    connectBtn.disabled = true;
                } else {
                    msgInputBox.disabled = true;
                    sendBtn.disabled = true;
                    connectBtn.disabled = false;
                    disconnectBtn.disabled = true;
                }
            }
        } catch (error) {
            console.warn("Error on handleSendChannelStatusChange ->", error);
        }
    }

    function handleReceiveChannelStatusChange(event) {
        try {
            console.log("handleReceiveChannelStatusChange event->", event);

            if (receiveChannel) {
                console.log("Receive channel status has changed to " + receiveChannel.readyState);
            }
        } catch (error) {
            console.warn("Error on handleReceiveChannelStatusChange ->", error);
        }
    }

    function sendMessage() {
        try {
            let message = msgInputBox.value;

            sendChannel.send(message);

            msgInputBox.value = '';
            msgInputBox.focus();
        } catch (error) {
            console.warn("Error on sendMessage ->", error);
        }
    }

    function handleReceiveMessage(event) {
        try {
            let el = document.createElement("p");
            let txtNode = document.createTextNode(event.data);

            console.log("txtNode ->", txtNode);

            el.appendChild(txtNode);
            receiveBox.appendChild(el);
        } catch (error) {
            console.warn("Error on handleReceiveMessage ->", error);
        }
    }

    function disconnectPeers() {
        // Close open data channels
        sendChannel.close();
        receiveChannel.close();

        // Close peer connections
        localConnect.close();
        remoteConnect.close();

        sendChannel = null;
        receiveChannel = null;
        localConnect = null;
        remoteConnect = null;

        // UI updates
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        sendBtn.disabled = true;

        msgInputBox.value = '';
        msgInputBox.disabled = true;
    }


    window.addEventListener('load', startUp, false);
})();