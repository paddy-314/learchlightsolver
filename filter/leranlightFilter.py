import json

#loadCards in network tab

def gen_dict_extract(key, var):
    if hasattr(var,'items'):
        for k, v in var.items():
            if k == key:
                yield v
            if isinstance(v, dict):
                for result in gen_dict_extract(key, v):
                    yield result
            elif isinstance(v, list):
                for d in v:
                    for result in gen_dict_extract(key, d):
                        yield result

with open("./jsonDump.json", "r", encoding='utf-8') as dump:
    jsonData = json.loads(dump.read())
    CardProfileModel = gen_dict_extract("CardProfileModel", jsonData)
    for i, item in enumerate(CardProfileModel):
        type = item["Card"]["CardTypeCode"]
        print(f"{i+1}: {type}")
        answerDict = {}
        for answer in gen_dict_extract("Answer", item):
            if answer['IndexNumber'] not in answerDict:
                answerDict[answer['IndexNumber']] = answer
            else:
                answerDict[len(answerDict)] = answer
        for i in range(len(answerDict)): #sorting
            match type:
                case "MATCHVER" | "MATCHHOR":
                    print(f"text: '{answerDict[i]['FixedText']}', answer: {answerDict[i]['MovableText']}")
                case "MULTIONEANSWER" | "BINTRUEFALSE" | "BINYESNO" | "BINCORINCOR":
                    if answerDict[i]['IsCorrect'] == True:
                        print(f"text: '{answerDict[i]['AnswerText']}', isCorrect: {answerDict[i]['IsCorrect']}")
                case "FIBDROPDOWN" | "FIBDRAGDROP":
                    if answerDict[i]['IsCorrect'] == True:
                        print(f"text: '{answerDict[i]['AnswerText']}', isCorrect: {answerDict[i]['IsCorrect']}, indexNumber: {answerDict[i]['IndexNumber']}")
                case "IDENTIFY":
                    if answerDict[i]['IsIdentified'] == True:
                        print(f"text: '{answerDict[i]['AnswerText']}', isCorrect: {answerDict[i]['IsIdentified']}")
                case "GROUP":
                    try:
                        print(f"text: '{answerDict[i]['AnswerText']}', parentID: {answerDict[i]['ParentId']}")
                    except KeyError:       
                        None
                case _:
                    print(f"text: '{answerDict[i]['AnswerText']}', isCorrect: {answerDict[i]['IsCorrect']}, indexNumber: {answerDict[i]['IndexNumber']}")
        print("\n")
    dump.close()
