import { defaultConfig } from './defaultConfig';

export const clientPresets = {
  sana: {
    ...defaultConfig,
    id: "sana",
    clientName: "Sana (Default Vintage Gold)",
  },
  maya: {
    ...defaultConfig,
    id: "maya",
    clientName: "Maya (Romantic Rose)",
    birthDateLabel: "NOV 15",
    hero: {
      ...defaultConfig.hero,
      recipientName: "Maya",
      highlightColor: "#e11d48",
      message: "To the girl who fills my world with color and warmth. May this year be as magical and radiant as you are!",
    },
    chat: {
      ...defaultConfig.chat,
      contactName: "Sweet Maya 🌸",
      messages: [
        { id: "m1", text: "Happy birthday my love ❤️", reaction: null },
        { id: "m2", text: "Counting down the seconds until I see you today", reaction: null },
        { id: "m3", text: "Here is your little personalized universe ✨", reaction: "❤️" },
      ]
    },
    cinema: {
      ...defaultConfig.cinema,
      saveTheDateText: "SAVE THE DATE • NOVEMBER 15 • SAVE THE DATE • NOVEMBER 15 •",
      productionSub: "a little production, live November 15th",
      eventDateDisplay: "NOVEMBER 15"
    }
  },
  liam: {
    ...defaultConfig,
    id: "liam",
    clientName: "Liam (Modern Noir)",
    birthDateLabel: "DEC 24",
    hero: {
      ...defaultConfig.hero,
      recipientName: "Liam",
      highlightColor: "#3b82f6",
      message: "Happy Birthday to my rock, my best friend, and the coolest human alive. Here's to another unforgettable chapter together!",
    },
    chat: {
      ...defaultConfig.chat,
      contactName: "Best Guy Liam ⚡",
      messages: [
        { id: "m1", text: "Happy birthday bro!", reaction: null },
        { id: "m2", text: "Built this special site just for you 🎂", reaction: "🔥" },
      ]
    },
    cinema: {
      ...defaultConfig.cinema,
      saveTheDateText: "SAVE THE DATE • DECEMBER 24 • SAVE THE DATE • DECEMBER 24 •",
      productionSub: "an epic premiere, live December 24th",
      eventDateDisplay: "DECEMBER 24"
    }
  }
};
