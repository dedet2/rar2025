export default function TrustCard({title,desc}:{title:string;desc:string}){
  return(<div className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="font-semibold">{title}</div><div className="text-white/70 text-sm mt-1">{desc}</div></div>);
}