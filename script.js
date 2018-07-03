var pc1 = new RTCPeerConnection()
var pc2 = new RTCPeerConnection()
var pc1video = document.getElementById("pc1video")
var pc1video2 = document.getElementById("pc1video2")
var pc2video = document.getElementById("pc2video")

var removingStream = null
var removingSender = null
var removingSender2 = null


async function getExactVideoDevice(deviceId) {
  devices = await navigator.mediaDevices.enumerateDevices()
  videos = devices.filter(device => device.kind==="videoinput")
  exactDevice = {deviceId: {exact: videos[deviceId].deviceId}}

  return await navigator.mediaDevices.getUserMedia({video: exactDevice})
}


pc1.ontrack = event => {
  pc2video.srcObject = event.streams[0]
}

// toggle two video element
var videoToggle = true
pc2.ontrack = event => {
  stream = event.streams[0]

  if (videoToggle) {
    pc1video.srcObject = stream
  } else {
    pc1video2.srcObject = stream
  }

  videoToggle = !videoToggle
  // set event "removetrack"
  stream.onremovetrack = e => console.info(e)
}
// set event "removestream"
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
async function nego (event) {
  if (pc1.signalingState !== "stable") {
    setTimeout(() => nego(event), 100)
    return
  }

  offer = await pc1.createOffer()
  await pc2.setRemoteDescription(offer)
  await pc1.setLocalDescription(offer)

  pc2stream = await getExactVideoDevice(0)
  pc2sender = pc2.addTrack(pc2stream.getTracks()[0], pc2stream)
  answer = await pc2.createAnswer()
  await pc1.setRemoteDescription(answer)
  await pc2.setLocalDescription(answer)
}

pc1.onnegotiationneeded = nego


// connection
async function call () {
  pc1stream = await getExactVideoDevice(1)
  pc1stream2 = await getExactVideoDevice(2)
  pc1sender = pc1.addTrack(pc1stream.getTracks()[0], pc1stream)
  pc1sender2 = pc1.addTrack(pc1stream2.getTracks()[0], pc1stream2)

  removingStream = pc1stream
  removingSender = pc1sender
  removingSender2 = pc1sender2
}

function removeStream() {
  pc1.removeStream(removingStream)
}

function removeTrack() {
  pc1.removeTrack(removingSender)
}

function removeTrack2() {
  pc1.removeTrack(removingSender2)
}

document.getElementById("call").addEventListener("click", call)
document.getElementById("removeStream").addEventListener("click", removeStream)
document.getElementById("removeTrack").addEventListener("click", removeTrack)
document.getElementById("removeTrack2").addEventListener("click", removeTrack2)
