
try:
    with open("verify_output_final.txt", "r", encoding="utf-16-le") as f:
        print(f.read())
except Exception as e:
    # Try utf-8 just in case
    try:
        with open("verify_output_final.txt", "r", encoding="utf-8") as f:
            print(f.read())
    except:
        print("Could not read file.")
