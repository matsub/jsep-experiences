var pc1 = new RTCPeerConnection()
var pc2 = new RTCPeerConnection()
var pc1video = document.getElementById("pc1video")
var pc2video = document.getElementById("pc2video")
var pc2video2 = document.getElementById("pc2video2")

var removingSender = null;


async function getExactVideoDevice(deviceId) {
  devices = await navigator.mediaDevices.enumerateDevices()
  videos = devices.filter(device => device.kind==="videoinput")
  exactDevice = {deviceId: {exact: videos[deviceId].deviceId}}

  return await navigator.mediaDevices.getUserMedia({video: exactDevice})
}


var videoToggle = true
pc1.ontrack = event => {
  let _pc2video = null

  if (videoToggle) {
    _pc2video = pc2video
  } else {
    _pc2video = pc2video2
  }
  videoToggle = !videoToggle

  _pc2video.srcObject = event.streams[0]
}
pc2.ontrack = event => {
  stream = event.streams[0]
  pc1video.srcObject = stream
  stream.onremovetrack = e => console.info(e)
}
pc2.onremovestream = e => console.info(e)


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
  await pc2.setRemoteDescription(offer)
  await pc1.setLocalDescription(offer)

  pc2stream = await getExactVideoDevice(0)
  pc2sender = pc2.addTrack(pc2stream.getTracks()[0], pc2stream)
  answer = await pc2.createAnswer()
  await pc1.setRemoteDescription(answer)
  await pc2.setLocalDescription(answer)
}


// connection
async function call () {
  pc1stream = await getExactVideoDevice(1)
  pc1sender = pc1.addTrack(pc1stream.getTracks()[0], pc1stream)
  removingSender = pc1sender
}

function removeTrack() {
  pc1.removeTrack(removingSender)
}

document.getElementById("call").addEventListener("click", call)
document.getElementById("removeTrack").addEventListener("click", removeTrack)
