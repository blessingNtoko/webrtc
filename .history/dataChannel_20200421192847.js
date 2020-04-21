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
        // Create local peer connection
        localConnect = new RTCPeerConnection();

        // Create data channel on local peer connection
        sendChannel = localConnect.createDataChannel("sendChannel");
        // Adding event listeners to monitor if channel is open or closed
        sendChannel.onopen = handleSendChannelStatusChange;
        sendChannel.onclose = handleSendChannelStatusChange;

        // Create remote peer connection
        remoteConnect = new RTCPeerConnection();
        // Use RTCDataChannel object of remote peer to listen for data channel connection from local
        remoteConnect.ondatachannel = receiveChannelCallback;

        // Setting up ICE  candidates for both peers

        localConnect.onicecandidate = (e) => !e.candidate || remoteConnect.addIceCandidate(e.candidate).catch(handleAddCandidateError);

        remoteConnect.onicecandidate = (e) => !e.candidate || localConnect.addIceCandidate(e.candidate).catch(handleAddCandidateError);

        // Create connection offer to send to remote peer
        localConnect.createOffer().then((offer) => {
            localConnect.setLocalDescription(offer);
        }).then(() => {
            remoteConnect.setRemoteDescription(localConnect.localDescription);
        }).then(() => {
            remoteConnect.createAnswer();
        }).then((answer) => {
            remoteConnect.setLocalDescription(answer);
        }).then(() => {
            localConnect.setRemoteDescription(remoteConnect.localDescription);
        }).catch(handleCreateDescriptionError);
    }

    // handle error when creating description.
    // can happen when creating offer and answer.
    // handled the same here
    function handleCreateDescriptionError(error) {
        console.log('Unable to create offer/answer: ' + error.toString());
    }

    // handle successful adding of ice candidate on local and remote
    function handleLocalAddCandidateSuccess() {
        connectBtn.disabled = true;
    }

    function handleRemoteAddCandidateSuccess() {
        disconnectBtn.disabled = false;
    }

    function handleAddCandidateError() {
        console.log("Failed to add ice candidate");
    }

    // handle receiving data channel object
    function receiveChannelCallback(event) {
        receiveChannel = event.channel;
        receiveChannel.onmessage = handleReceiveMessage;
        receiveChannel.onopen = handleReceiveChannelStatusChange;
        receiveChannel.onclose = handleReceiveChannelStatusChange;
    }

    // handle channel status change
    function handleSendChannelStatusChange(event) {
        console.log("handleSendChannelStatusChange event->", event);
        if (sendChannel) {
            var state = sendChannel.readyState;

            // UI changes when state is open or closed
            if (state === "open") {
                msgInputBox.disabled = false;
                msgInputBox.focus();
                sendBtn.disabled;
                disconnectBtn.disabled = false;
                connectBtn.disabled = true;
            } else {
                msgInputBox.disabled = true;
                sendBtn.disabled = true;
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
            }
        }
    }

    function handleReceiveChannelStatusChange(event) {
        console.log("handleReceiveChannelStatusChange event->", event);
        if (receiveChannel) {
            console.log("Receive channel status has changed to " + receiveChannel.readyState);
        }
    }

    function sendMessage() {
        let message = msgInputBox.value;
        sendChannel.send(message);

        msgInputBox.value = '';
        msgInputBox.focus();
    }

    function handleReceiveMessage(event) {
        let el = document.createElement("p");
        let txtNode = document.createTextNode(event.data);

        el.appendChild(txtNode);
        receiveBox.appendChild(el);
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