export default async function handler(req,res){

try{

let body=req.body

if(!body || typeof body==="string"){
body=JSON.parse(body || "{}")
}

const {name,prompt}=body

if(!name || !prompt){
return res.status(400).json({error:"Missing name or prompt"})
}

const VOICE_ID="hpp4J3VqNfWAU000d1Us"

const response=await fetch(
`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
{
method:"POST",

headers:{
"xi-api-key":process.env.ELEVENLABS_API_KEY,
"Content-Type":"application/json",
"Accept":"audio/mpeg"
},

body:JSON.stringify({
text:`Sing a happy Afrobeats song for ${name}. ${prompt}. Use Nigerian accent.`,
model_id:"eleven_multilingual_v2"
})

}
)

if(!response.ok){

const error=await response.text()

return res.status(500).json({error})

}

const audioBuffer=await response.arrayBuffer()

res.setHeader("Content-Type","audio/mpeg")

res.send(Buffer.from(audioBuffer))

}catch(error){

res.status(500).json({error:error.message})

}

}
