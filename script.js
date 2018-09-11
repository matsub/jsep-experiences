var pc1 = new RTCPeerConnection()
var pc2 = new RTCPeerConnection()
var pc1video = document.getElementById("pc1video")
var pc2video = document.getElementById("pc2video")



async function getExactVideoDevice(deviceId) {
    devices = await navigator.mediaDevices.enumerateDevices()
    videos = devices.filter(device => device.kind==="videoinput")
    exactDevice = {deviceId: {exact: videos[deviceId].deviceId}}

    return await navigator.mediaDevices.getUserMedia({video: exactDevice})
}

function removeVPX(origin, codec) {
    return new RTCSessionDescription({
        type: origin.type,
        sdp: origin.sdp.replace(/a=.*(96|97|98|99) .*\r\n/g, '').replace('96 97 98 99 ', '')
    })
}


pc1.ontrack = event => { pc2video.srcObject = event.streams[0] }
pc2.ontrack = event => { pc1video.srcObject = event.streams[0] }


// ICE handler
pc1.onicecandidate = event => {
    if (event.candidate) {
        pc2.addIceCandidate(event.candidate)
    }
}
pc2.onicecandidate = event => {
    if (event.candidate) {
        pc1.addIceCandidate(event.candidate)
    }
}


// negotiation
pc1.onnegotiationneeded = async event => {
    offer = await pc1.createOffer()
    offer = removeVPX(offer)
    console.log(offer.sdp)
    await pc2.setRemoteDescription(offer)
    await pc1.setLocalDescription(offer)

    pc2stream = await getExactVideoDevice(0)
    pc2.addTrack(pc2stream.getTracks()[0], pc2stream)
    answer = await pc2.createAnswer()
    answer = removeVPX(answer)
    await pc1.setRemoteDescription(answer)
    await pc2.setLocalDescription(answer)
}


// connection
async function call () {
    pc1stream = await getExactVideoDevice(1)
    pc1.addTrack(pc1stream.getTracks()[0], pc1stream)
}

document.getElementById("call").addEventListener("click", call)
