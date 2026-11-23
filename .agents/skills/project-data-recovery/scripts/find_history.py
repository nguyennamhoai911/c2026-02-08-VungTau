"""Search archived titles/indexed text or read one archived brain artifact."""
import argparse,json,sys,zipfile
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
root=Path(json.loads((Path(__file__).resolve().parents[1]/'references'/'locations.json').read_text(encoding='utf-8'))['antigravity_backup'])
p=argparse.ArgumentParser()
p.add_argument('query',nargs='?',default='')
p.add_argument('--id');p.add_argument('--artifact');p.add_argument('--limit',type=int,default=10)
a=p.parse_args()
if a.artifact:
    if not a.id or not a.artifact.startswith('brain/'+a.id+'/'):
        p.error('--artifact must be a brain path belonging to --id')
    with zipfile.ZipFile(root/'brain-conversations.zip') as z:
        data=z.read(a.artifact)
        if b'\x00' in data[:1000]:p.error('Binary artifact; use its archive path with an appropriate viewer')
        print(data.decode('utf-8',errors='replace')[:20000])
elif a.id:
    index=json.loads((root/'index.json').read_text(encoding='utf-8'))
    print(json.dumps([x for x in index if x['id']==a.id],ensure_ascii=False,indent=2))
    with zipfile.ZipFile(root/'brain-conversations.zip') as z:
        names=[n for n in z.namelist() if n.startswith('brain/'+a.id+'/') or n=='conversations/'+a.id+'.db']
        for n in names[:100]:print(n)
    print('artifact_count:',len(names))
else:
    if not a.query:p.error('Supply a search phrase or --id')
    query=a.query.casefold();count=0
    for item in json.loads((root/'index.json').read_text(encoding='utf-8')):
        if query in (item['title']+' '+item['workspace_uris']).casefold():
            print(json.dumps({'id':item['id'],'title':item['title'],'match':'metadata'},ensure_ascii=False))
            count+=1
            if count>=a.limit:break
    if count<a.limit:
        with (root/'indexed-text.jsonl').open(encoding='utf-8') as f:
            for line in f:
                item=json.loads(line)
                body=(item.get('user_body') or '')+'\n'+(item.get('agent_body') or '')
                position=body.casefold().find(query)
                if position>=0:
                    print(json.dumps({'id':item['id'],'title':item['title'],'chunk':item['chunk_index'],'excerpt':body[max(0,position-120):position+500]},ensure_ascii=False))
                    count+=1
                    if count>=a.limit:break
    print('matches_shown:',count)
