import re
import json
import time
import os
import uuid

def extract_prompts(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return

    # Split by the pattern # 【N】Title
    # We use a regex that matches the start of the line, #, space, 【, digits, 】, then the title
    # The splitting will keep the specific delimiter if we capture it, but it's easier to just finditer.
    
    # Pattern to match the header: ^# 【(\d+)】(.+)$
    # However, looking at the file, the format seems to be:
    # # 【1】巨聪明仓鼠参谋
    # ## 巨聪明仓鼠参谋
    # ...
    # # 【2】正则表达式教练
    
    # We will split the file by the level 1 header pattern used in the file.
    
    # Regex explanation:
    # ^# 【\d+】.*$ matches the lines like "# 【1】巨聪明仓鼠参谋"
    # We look for these lines.
    
    matches = list(re.finditer(r'^# 【\d+】(.+?)\s*$', content, re.MULTILINE))
    
    prompts = []
    
    for i, match in enumerate(matches):
        title = match.group(1).strip()
        start_index = match.end()
        
        # Determine end index (start of next match or end of file)
        if i + 1 < len(matches):
            end_index = matches[i+1].start()
        else:
            end_index = len(content)
            
        prompt_content = content[start_index:end_index].strip()
        
        # Determine Prompt Content cleanliness
        # The file often has:
        # ## Title again
        # 
        # ## 开场白...
        #
        # We might want to keep the raw markdown content as requested "contents of this file".
        # The user said "Please organize the prompt words in this file into a json format".
        # Usually, the prompt is the whole text for that section.
        
        # Let's clean up a little: if the first few lines are just repetition of the title in ##, maybe keep it?
        # Actually, standard practice for "Prompt" in this context is likely the whole system instruction.
        # So we keep the markdown as is, just trimmed.
        
        timestamp = int(time.time() * 1000)
        
        prompt_data = {
            "id": str(uuid.uuid4()),
            "title": title,
            "content": prompt_content,
            "tags": [],
            "timestamp": timestamp,
            "updatedAt": timestamp
        }
        prompts.append(prompt_data)
        
    output_path = os.path.join(os.path.dirname(file_path), 'prompts_import.json')
    
    # Final wrapper structure? 
    # UsePrompts.ts fetch returns `json.prompts as Prompt[]`.
    # Usually valid JSON import might just be the array or an object. 
    # Let's save as an object with specific key just to be safe or just the array?
    # The user asked for "json format that can be directly imported into this website".
    # I don't see an "Import" feature in the code snippets I saw, but usually bulk imports expect an array or a specific wrapped object.
    # Looking at `app/hooks/usePrompts.ts`, the GET /api/prompts endpoint returns `{ prompts: [...] }`.
    # So if I were to "import" (maybe by replacing the file or posting), the structure isn't strictly defined for *importing* by the code I saw.
    # However, providing a clean JSON array is the most standard "import format". 
    # To be safe, I will output an object `{ "prompts": [...] }` which matches the API response structure, which is often symmetric to import structure.
    
    output_data = prompts
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully extracted {len(prompts)} prompts to {output_path}")

if __name__ == "__main__":
    extract_prompts(r"d:\Repositories\Prompts\拉小登-小笔记-temp.md")
