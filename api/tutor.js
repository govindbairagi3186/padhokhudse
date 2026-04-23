export default async function handler(req,res){
  try{
    const {topic}=req.body;

    const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization":"Bearer "+process.env.OPENROUTER_API_KEY,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:"openrouter/auto",
        messages:[{role:"user",content:topic}]
      })
    });

    const d=await r.json();

    res.json({
      result:d.choices?.[0]?.message?.content || "Error"
    });

  }catch(e){
    res.json({result:e.message});
  }
}
