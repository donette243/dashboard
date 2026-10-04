import { useEffect, useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);
  const saveHistory = (q) => {
    const updated = [q, ...history].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };
  const askAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "user",
                content: question,
              },
            ],
            temperature: 0.7,
          }),
        }
      );

      const text = await response.text();

      if (!response.ok) {
        console.log("GROQ ERROR:", text);
        setAnswer("Erreur API Groq");
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);

      const aiResponse = data?.choices?.[0]?.message?.content;

      if (!aiResponse) {
        setAnswer("Pas de réponse de l'IA");
        setLoading(false);
        return;
      }

      setAnswer(aiResponse);
      saveHistory(question);
    } catch (error) {
      console.log(error);
      setAnswer("Erreur réseau ou API");
    }

    setLoading(false);
  };

  const copyAnswer = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    alert("Copié !");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>AI Ассистент команды</h1>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Введите ваш вопрос..."
          style={styles.textarea}
        />

        <button onClick={askAI} style={styles.button}>
          {loading ? "Загрузка..." : "Спросить AI"}
        </button>

        <div style={styles.box}>
          <h3>Ответ</h3>
          <p style={styles.answer}>
            {answer || "Ответ появится здесь..."}
          </p>

          {answer && (
            <button onClick={copyAnswer} style={styles.copy}>
              Копировать
            </button>
          )}
        </div>

        <div style={styles.box}>
          <h3>История (последние 5)</h3>

          {history.length === 0 ? (
            <p>Нет истории</p>
          ) : (
            history.map((h, i) => (
              <p key={i}>• {h}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    fontFamily: "Arial",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "750px",
    background: "white",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  textarea: {
    width: "100%",
    height: "120px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    resize: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "20px",
    fontSize: "16px",
  },

  box: {
    background: "#f4f4f4",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "15px",
  },

  answer: {
    whiteSpace: "pre-wrap",
    lineHeight: "1.5",
  },

  copy: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default App;