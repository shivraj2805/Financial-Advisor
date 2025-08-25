const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateFinancialAdvice = async (req, res) => {
  try {
    console.log("Received request:", req.body);

    const {
      name,
      age,
      monthly_income,
      financial_goal,
      location,
      preferred_language,
      business_type,
      existing_savings,
      risk_tolerance,
    } = req.body;

    if (
      !name ||
      !age ||
      !monthly_income ||
      !financial_goal ||
      !location ||
      !preferred_language ||
      !business_type ||
      !existing_savings ||
      !risk_tolerance
    ) {
      console.error("Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = `You are a highly experienced financial advisor with deep expertise in personal finance, investment planning, and financial regulations. Generate a detailed, comprehensive financial advice report for ${name} with the following profile:

**Client Profile:**
- Name: ${name}
- Age: ${age}
- Monthly Income: ₹${monthly_income}
- Financial Goal: ${financial_goal}
- Location: ${location}
- Preferred Language: ${preferred_language}
- Business Type: ${business_type}
- Existing Savings: ₹${existing_savings}
- Risk Tolerance: ${risk_tolerance}

Please provide an in-depth, long-form analysis roughly 2 to 3 pages long. Structure your response into clear sections and include detailed discussion, actionable advice, and practical examples. Incorporate the following schemes, guidelines, and frameworks into your advice:

1. **Personalized Financial Planning Framework for ${name}:** 
   - Assessment of ${name}'s current financial status including cash flow, assets, liabilities, and net worth.
   - Goal setting (short-term, medium-term, long-term) with timelines and measurable milestones tailored to ${name}'s specific situation.
  
2. **Budgeting and Cash Flow Management for ${name}:**
   - Strategies for tracking income and expenses based on ${name}'s ₹${monthly_income} monthly income.
   - Recommendations for discretionary spending control and automated savings considering ${name}'s family and business needs.

3. **Investment Planning for ${name}:**
   - Diversified investment options aligned with ${name}'s ${risk_tolerance} risk tolerance and financial goals.
   - Explanation of risk vs. return for different asset classes (equities, bonds, mutual funds, real estate, etc.) suitable for ${name}'s profile.
   - Suggestions on tax-efficient investment vehicles relevant to ${name}'s location in ${location}.

4. **Savings Plans and Emergency Funds for ${name}:**
   - Step-by-step savings strategies to build and maintain an emergency fund covering 3 to 6 months of expenses for ${name}.
   - Advice on systematic savings and high-yield accounts considering ${name}'s current savings of ₹${existing_savings}.

5. **Risk Management and Insurance for ${name}:**
   - Evaluation of insurance needs (life, health, business, disability, etc.) to protect ${name} against unforeseen events.
   - Risk mitigation techniques consistent with ${name}'s stated ${risk_tolerance} risk tolerance.

6. **Retirement Planning for ${name}:**
   - Estimation of retirement needs and income replacement ratios for ${name} at age ${age}.
   - Utilizing employer-sponsored plans, IRAs, and other retirement accounts available based on ${name}'s location in ${location}.

7. **Tax Planning Guidelines for ${name}:**
   - Strategies for tax optimization including use of tax-advantaged accounts, deductions, credits, and income timing for ${name}.
   - Compliance with local tax regulations and incentives in ${location}.

8. **Debt Management and Credit Strategies for ${name}:**
   - Prioritizing high-interest debt repayments for ${name}'s financial situation.
   - Advice on debt consolidation or refinancing if applicable to ${name}'s circumstances.

9. **Location-Specific Financial Considerations for ${name}:**
   - Relevant local financial regulations, market conditions, and investment products in ${location}.
   - Economic and tax environment affecting ${name}'s financial decisions in ${location}.

10. **Business Financial Guidelines for ${name}:**
    - Recommendations for managing business income and expenses for ${name}'s ${business_type} business.
    - Strategies for separating personal and business finances for ${name}.
    - Advice on business savings, reinvestment, and growth opportunities for ${name}'s specific business type.

11. **Personalized Action Plan Summary for ${name}:**
    - Clear, prioritized steps for implementation tailored to ${name}'s specific situation.
    - Recommended timeline for reviews and adjustments for ${name}.
    - Suggestions for ongoing financial education and professional consultations for ${name}.

Ensure the entire response is written exclusively in ${preferred_language}. Use clear, formal, and engaging language that educates ${name}, emphasizing practical and customized advice. Address ${name} directly throughout the response to make it more personal and relevant. Avoid brevity and elaborate on each section with rich detail so ${name} gains a deep understanding and a concrete roadmap to follow.

Make the advice feel personal and directly addressed to ${name}, using their name throughout the response to create a more engaging and personalized experience and in ans do not provide date.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("Sending request to Gemini API...");
    const result = await model.generateContent([prompt]);

    console.log("Raw API Response:", JSON.stringify(result, null, 2));

    // ✅ Fix: Properly extract response text
    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error("Empty response from Gemini API");
      return res.status(500).json({ error: "Empty response from Gemini API" });
    }

    console.log("Processed Response:", responseText);

    // ✅ Fix: Send response as JSON object
    res.json({ financial_advice: responseText });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message }); // Removed the extra 'c'
  }
};

// New function for dynamic chatbot conversations
const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a context-aware prompt for the financial chatbot
    const systemPrompt = `You are "Dhan Sarthi", a knowledgeable and friendly financial advisor specializing in Indian financial markets, government schemes, and personal finance. You help users with:

1. **Personal Finance Questions**: Budgeting, saving, investing, debt management
2. **Investment Advice**: Mutual funds, stocks, bonds, real estate, gold, etc.
3. **Government Schemes**: PM schemes, subsidies, loans, and financial assistance programs
4. **Tax Planning**: Income tax, GST, tax-saving investments
5. **Business Finance**: Small business funding, MSME schemes, business planning
6. **Financial Education**: Basic concepts, market understanding, risk management

Guidelines:
- Provide practical, actionable advice
- Be conversational and friendly
- Keep responses concise but informative (2-4 sentences for simple questions, up to 6-8 sentences for complex topics)
- Include specific examples when relevant
- Mention relevant government schemes when applicable
- Always prioritize user's financial well-being and safety
- If you don't know something specific, suggest consulting a professional
- Use simple language that's easy to understand

Current conversation context:`;

    // Build conversation context
    let conversationContext = systemPrompt;
    if (conversationHistory.length > 0) {
      conversationContext += "\n\nPrevious conversation:\n";
      conversationHistory.forEach((msg, index) => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Dhan Sarthi'}: ${msg.content}\n`;
      });
    }

    const fullPrompt = `${conversationContext}\n\nUser: ${message}\n\nDhan Sarthi:`;

    console.log("Sending chat request to Gemini API...");
    const result = await model.generateContent([fullPrompt]);

    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error("Empty response from Gemini API");
      return res.status(500).json({ error: "Empty response from Gemini API" });
    }

    console.log("Chat Response:", responseText);

    res.json({ 
      response: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Chat Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateFinancialAdvice, chatWithBot };
