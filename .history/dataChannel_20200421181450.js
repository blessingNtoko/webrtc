(() => {
    // Defining global variables to be used
    var connectBtn = null;
    var disconnectBtn = null;
    var sendBtn = null;
    var msgInputBox = null;
    var receiveBox = null;

    var localConnect = null;
    var remoteConnect = null;


    var sendChannel = null;
    var receiveChannel = null;



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
        const remoteConnect = new RTCPeerConnection();
        // Use RTCDataChannel object of remote peer to listen for data channel connection from local
        remoteConnection.ondatachannel = receiveChannelCallback;
    }
})();