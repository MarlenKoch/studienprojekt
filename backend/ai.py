# import ollama

# user_prompt = "Why is the sky blue?"

# system_prompt = "every third word in your response is 'quack'"


# response = ollama.chat(
#     model="llama3.2",
#     messages=[
#         {"role": "system", "content": system_prompt},
#         {"role": "user", "content": user_prompt},
#     ],
# )
# model_response = response["message"]["content"]

# print("System Prompt:", system_prompt)
# print("User Prompt:", user_prompt)
# print("Model Response:", model_response)

from flask import Flask, request, jsonify
import ollama

app = Flask(__name__)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json

    user_prompt = data.get("user_prompt", "")
    system_info = data.get("system_info", "")
    system_prompt = f"You are an assistant specializing in: {system_info}"

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    model_response = response["message"]["content"]

    return jsonify({"response": model_response})


if __name__ == "__main__":
    app.run(debug=True)
