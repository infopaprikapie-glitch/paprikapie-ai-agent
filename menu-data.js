// Real PaprikaPie menu data (as per 23 March 2026 price list) — used to ground the AI agent's answers.

const BUSINESS = {
  name: "PaprikaPie",
  address: "M.G. Road, Opp. Stadium Market, Safidon - 126112 (Jind), Haryana",
  phone: "9896333158",
  whatsapp: "919896333158",
  email: "info.paprikapie@gmail.com",
  service: "Dine-in, Takeaway & Home Delivery in Safidon & nearby areas",
};

const OFFERS = [
  "6 Pizza Combo — six mini pizzas (Margherita, Farmhouse, Paneer Tikka, Chicken Sausage, Peri Peri Chicken, Cheese Corn) for just ₹360. Packing charges extra.",
  "Vada Pav Offer — 1 pc @ ₹50 or 2 pc @ ₹70, served with spicy or green mint chutney. 20% off, limited time.",
];

const MENU_TEXT = `
PIZZA (prices: Regular / Medium / Large / Ex. Large):
- Any One Topping Pizza (Cheesy, Corn, Capsicum, Onion, Tomato or Soya): 100/199/299/349
- Onion Fresh Delight: 129/249/349/449
- Veg Pie: 129/249/349/449
- Spicy Triple Tango: 159/299/399/499
- Panner Pizza: 189/299/399/499
- Fresh Farmers Choice: 199/299/399/499
- Queen Margherita: 249/349/449/599
- Farm Villa: 299/379/499/599
- Panner Overloaded: 299/399/499/599
- Makhani Pizza: 299/399/499/599
- Italian Pizza: 349/449/549/649
- Paprika Exotica: 349/449/549/649
- Farm House: 399/499/599/699
- Tandoori Panner Tikka Butter Masala: 349/449/549/649
- Paprika Special Panner Pizza: 399/499/549/649

GARLIC BREAD: Corn Garlic Bread 99, Stuffed Garlic Bread 139, Panner Garlic Bread 159
PASTA: Red Sauce 139, Makhani Sauce 169, White Sauce 179, Mix Sauce 179
SANDWICHES: Grilled 99, Cheese Grilled 139, Spicy Panner 149, Makhani Panner 159
BURGERS: Aloo Tikki 59, Veggie Tikki 69, Cheesy Burger 119, Tandoori Panner Burger 149
FRIES: French Fries 99, Masala Fries 119, Peri-Peri Fries 129, Cheesy Fries 149
WRAPS: Aloo Tikki 139, Fresh Veggie 159, Spicy Panner 179

SOUTH INDIAN DOSA (add ₹30 for extra butter): Masala Dosa 100, Onion Masala Dosa 120, Panner Masala Dosa 170, Italian Masala Dosa 180, Paprika Spicale Dosa 240
CHAAP: Malai 150, Afghani 150, Tandoori 150, Spicy Masala 150, Achaari 150, KFC Chaap 220, Tandoori Panner Tikka 220, Mashroom Duplex 220, Mashroom Tikka 250

FAST FOOD - Maggi: Masala 59, Butter Masala 79, Veggie 89, Panner 99
PAV BHAJI: Pav Bhaji 100, Panner Pav Bhaji 130, Extra Pav 15
VADA PAV: Aloo 49, Veggie 69, Panner 89

CHINESE: Chowmein 100, Panner Chowmein 140, Singapuri Noodles 160, Hakka Noodles 160, Chilli Potato 180, Manchurian Dry 180, Manchurian Gravy 200, Panner Chilli 220, Mushroom Chilli 220, Soya Chilli 220, Honey Chilli Potato 220
MOMOS: Veggie Steam 90, Veggie Fry 100, Panner Steam 110, Panner Fry 130, Tandoori Fry 150, Kur-kura Fry 150, Veggie Spring Roll 100, Noodles Spring Roll 70

SHAKES: Vanilla 90, Butterscotch 90, Banana 90, Mango Mastani 100, Chocolate 110, Strawberry 110, Caramel 140, Oreo 140, Blueberry 140, Kit-Kat Chocolate 170, Bubblegum 180, Raspberry 180
MOCKTAILS: Lemon Mint Mojito 100, Blue Curacao Lagoon 120, Paan Mojito 140, Red Wine (mocktail) 160, Sweet and Sour Cordial 180
COLD COFFEE: Classic 120, Butterscotch 140, Chocolate 150, Hazelnut 160, Caramel 160
`.trim();

function buildSystemPrompt() {
  return `You are the official AI ordering assistant for ${BUSINESS.name}, a real restaurant at ${BUSINESS.address}.
You help customers browse the menu, get recommendations, understand current offers, answer FAQs, and build an order.

RULES:
- Only ever quote items and prices from the MENU below. Never invent dishes or prices.
- Be warm, quick, and appetite-forming, but concise — this is a chat window, not an essay.
- When a customer wants to order, build a running order summary (item, qty, price, running total) and confirm it back to them.
- Proactively mention relevant current offers when they fit what the customer is asking about.
- Once the customer confirms an order, tell them clearly: "Tap 'Send via WhatsApp' below and we'll confirm your order and delivery time right away."
- You cannot take payment or guarantee delivery times yourself — always route final confirmation through a human via WhatsApp or a call to ${BUSINESS.phone}.
- Service: ${BUSINESS.service}.

CURRENT OFFERS:
${OFFERS.map(o => "- " + o).join("\n")}

MENU:
${MENU_TEXT}
`;
}

module.exports = { BUSINESS, OFFERS, MENU_TEXT, buildSystemPrompt };
