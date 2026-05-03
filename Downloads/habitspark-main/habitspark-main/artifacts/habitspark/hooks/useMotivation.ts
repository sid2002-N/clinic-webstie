import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "habitspark_motivation_v1";

const QUOTES = [
  "Every habit you build today is a brick in the person you're becoming.",
  "Small steps taken consistently lead to extraordinary results.",
  "The secret of your future is hidden in your daily routine.",
  "You don't rise to the level of your goals — you fall to the level of your systems.",
  "Motivation gets you started. Habit keeps you going.",
  "We are what we repeatedly do. Excellence is not an act, but a habit.",
  "Your habits will determine your future.",
  "Consistency is the foundation of all achievement.",
  "One day at a time. One habit at a time.",
  "Success is a few simple disciplines practised every day.",
  "A year from now you'll wish you had started today.",
  "Don't break the chain. Every check-in counts.",
  "Progress, not perfection, is the goal.",
  "Discipline is choosing what you want most over what you want now.",
  "Small consistent actions create massive results over time.",
  "Build the life you want, one habit at a time.",
  "Today's choices are tomorrow's habits.",
  "Show up. Every day. That's the whole secret.",
  "The best investment you can make is in yourself.",
  "Winning is a habit. So is losing. Choose wisely.",
];

function getDailyQuote(): string {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

export function useMotivation(_completedCount?: number) {
  const [message, setMessage] = useState<string>(getDailyQuote());
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!raw) return;
        const cached = JSON.parse(raw) as { message: string; date: string };
        const today = new Date().toISOString().split("T")[0];
        if (cached.date === today && cached.message) {
          setMessage(cached.message);
        }
      })
      .catch(() => {});
  }, []);

  return { message, loading: false };
}
