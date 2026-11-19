"""Read a filled Chioutworks intake PDF and print the answers as Markdown (or JSON).

Usage:
  python read_answers.py filled.pdf            -> Markdown (question text in the form's language)
  python read_answers.py filled.pdf --json     -> JSON {question_id: answer}
  python read_answers.py filled.pdf --lang tr  -> Markdown with Turkish question text

Needs: pip install pypdf ; form_schema.json in the same folder.
"""
import json, sys, os
from pypdf import PdfReader

here = os.path.dirname(os.path.abspath(__file__))
schema = json.load(open(os.path.join(here, "form_schema.json"), encoding="utf-8"))


def txt(d, lang, market):
    return d.get(f"{lang}_{market}", d.get(lang, "")) if isinstance(d, dict) else ""


def main():
    pdf = sys.argv[1]
    r = PdfReader(pdf)
    meta = r.metadata or {}
    langs = str(meta.get("/Languages", "de")).split("+")
    market = str(meta.get("/Market", "DE"))
    lang = sys.argv[sys.argv.index("--lang") + 1] if "--lang" in sys.argv else langs[0]
    f = {k: v.get("/V") for k, v in (r.get_fields() or {}).items()}
    val = lambda k: str(f.get(k) or "").strip()

    out = {"_meta": {m: val(m) for m in schema["field_naming"]["meta"]},
           "_form": {"langs": langs, "market": market, "version": str(meta.get("/ChioutworksForm", ""))}}
    md = [f"# Chioutworks intake – {val('meta_company') or 'unknown'}", ""]
    md += [f"- **{m}**: {val(m)}" for m in schema["field_naming"]["meta"] if val(m)]
    for s in schema["sections"]:
        md += ["", f"## {txt(s['title'], lang, market)}"]
        for q in s["questions"]:
            qid, typ = q["id"], q["type"]
            if typ == "multi":
                chosen = [o for o in q["options"] if val(f"{qid}__{o['id']}") not in ("", "/Off")]
                ans = [txt(o["text"], lang, market) for o in chosen]
                out[qid] = [o["id"] for o in chosen]
            elif typ in ("single", "yn"):
                v = val(qid).lstrip("/")
                v = "" if v == "Off" else v
                out[qid] = v
                opt = next((o for o in q["options"] if o["id"] == v), None)
                ans = [txt(opt.get("text"), lang, market) or v] if opt else []
            elif typ == "consent":
                out[qid] = val(qid) not in ("", "/Off")
                ans = ["✔"] if out[qid] else []
            else:
                out[qid] = val(qid)
                ans = [val(qid)] if val(qid) else []
            for extra in ("other", "detail"):
                if q.get(extra) and val(f"{qid}__{extra}"):
                    out[f"{qid}__{extra}"] = val(f"{qid}__{extra}")
                    ans.append(f"({extra}: {val(qid + '__' + extra)})")
            md.append(f"**{q['no']}. {txt(q['text'], lang, market)}**  ")
            md.append(", ".join(ans) if ans else "_—_")
            md.append("")
    print(json.dumps(out, ensure_ascii=False, indent=1) if "--json" in sys.argv else "\n".join(md))


if __name__ == "__main__":
    main()
