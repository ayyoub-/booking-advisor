import OpenAI from 'openai';

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
    });
  }

  async analyzeHotels(hotels, userCriteria = {}) {
    try {
      console.log('🔍 Preparing hotel data for AI analysis...');
      
      // Préparer les données des hôtels pour OpenAI
      const hotelsData = hotels.map((hotel, index) => ({
        name: hotel.name,
        location: hotel.location || 'Unknown',
        rating: hotel.rating,
        totalReviews: hotel.totalReviews,
        reviews: hotel.scrapedReviews || [],
        keyInsights: hotel.keyInsights || []
      }));

      console.log('📊 Hotel data prepared:', hotelsData.map(h => h.name));
      if (Object.keys(userCriteria).length > 0) {
        console.log('🎯 User criteria:', userCriteria);
      }

      // Créer le prompt pour OpenAI avec les critères utilisateur
      const prompt = this.createAnalysisPrompt(hotelsData, userCriteria);

      console.log('🤖 Sending request to OpenAI...');

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert conseiller en voyage et hébergement avec plus de 15 ans d'expérience. Tu analyses les commentaires d'hôtels pour donner des recommandations personnalisées et professionnelles. Tu te bases PRINCIPALEMENT sur l'analyse des commentaires réels des clients pour identifier leurs véritables expériences, sentiments et besoins. Tu prends en compte la qualité du service, la propreté, l'emplacement, le rapport qualité-prix, et les besoins spécifiques des voyageurs selon leurs propres témoignages."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      console.log('📝 OpenAI response received');

      const response = completion.choices[0].message.content;
      
      // Parser la réponse pour extraire la recommandation
      const result = this.parseOpenAIResponse(response, hotelsData);
      
      console.log('✅ AI analysis completed successfully');
      return result;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI analysis failed: ${error.message}`);
    }
  }

  createAnalysisPrompt(hotelsData, userCriteria = {}) {
    let prompt = `Je compare ${hotelsData.length} hôtels pour un voyage. Voici les données de chaque hôtel basées sur des commentaires réels de Booking.com :

`;

    hotelsData.forEach((hotel, index) => {
      prompt += `HÔTEL ${index + 1}: ${hotel.name}
📍 Localisation: ${hotel.location}
⭐ Note moyenne: ${hotel.rating.toFixed(1)}/5
📊 Nombre de commentaires: ${hotel.totalReviews}
🔍 Insights clés: ${hotel.keyInsights.join(', ')}

Commentaires récents (échantillon):
`;

      // Ajouter quelques commentaires représentatifs
      const sampleReviews = hotel.reviews.slice(0, 8);
      sampleReviews.forEach(review => {
        prompt += `- ${review.score}/5: "${review.review}" (${review.date})\n`;
      });

      prompt += `\n---\n\n`;
    });

    // Ajouter les critères utilisateur si fournis
    if (Object.keys(userCriteria).length > 0) {
      prompt += `CRITÈRES DE SÉLECTION UTILISATEUR:
`;
      if (userCriteria.proximity) prompt += `- Proximité des attractions/transports: ${userCriteria.proximity}\n`;
      if (userCriteria.comfort) prompt += `- Niveau de confort recherché: ${userCriteria.comfort}\n`;
      if (userCriteria.ambiance) prompt += `- Ambiance souhaitée: ${userCriteria.ambiance}\n`;
      if (userCriteria.activities) prompt += `- Activités préférées: ${userCriteria.activities}\n`;
      if (userCriteria.travelType) prompt += `- Type de voyage: ${userCriteria.travelType}\n`;
      prompt += `\n`;
    }

    prompt += `En tant qu'expert conseiller en voyage avec 15 ans d'expérience, analyse ces hôtels en te basant PRINCIPALEMENT sur les commentaires réels des clients. 

ANALYSE REQUISE:
1. **Analyse sentimentale des commentaires**: Identifie les émotions, sentiments et expériences vécues par les clients
2. **Mots-clés récurrents**: Note les termes qui reviennent souvent dans les commentaires (propreté, service, emplacement, etc.)
3. **Problèmes récurrents**: Identifie les points négatifs mentionnés par plusieurs clients
4. **Points forts authentiques**: Les aspects que les clients apprécient vraiment selon leurs propres mots
5. **Cohérence des expériences**: Vérifie si les commentaires sont cohérents entre eux

Réponds au format JSON suivant :

{
  "recommendation": "Recommandation détaillée basée sur l'analyse des commentaires réels, expliquant pourquoi cet hôtel correspond le mieux aux attentes",
  "topChoice": 1,
  "analysis": {
    "strengths": ["Point fort identifié dans les commentaires", "Autre point fort mentionné par les clients"],
    "considerations": ["Point d'attention mentionné par les clients", "Aspect à considérer selon les commentaires"],
    "bestFor": "Type de voyageur idéal basé sur les commentaires et expériences partagées",
    "sentimentAnalysis": "Analyse du sentiment général des commentaires (très positif, positif, mitigé, etc.)",
    "keyWords": ["Mots-clés récurrents dans les commentaires", "Termes souvent mentionnés"],
    "recentTrends": "Tendances observées dans les commentaires récents"
  },
  "comparison": {
    "hotel1": "Analyse basée sur les commentaires de l'hôtel 1",
    "hotel2": "Analyse basée sur les commentaires de l'hôtel 2", 
    "hotel3": "Analyse basée sur les commentaires de l'hôtel 3"
  }
}

Remplace "topChoice" par le numéro de l'hôtel recommandé (1, 2, ou 3).`;

    return prompt;
  }

  parseOpenAIResponse(response, hotelsData) {
    try {
      // Essayer de parser le JSON de la réponse
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          recommendation: parsed.recommendation || "Recommandation basée sur l'analyse des commentaires",
          topChoice: (parsed.topChoice || 1) - 1, // Convertir en index 0-based
          analysis: parsed.analysis || {},
          comparison: parsed.comparison || {},
          rawResponse: response
        };
      } else {
        // Fallback si le JSON n'est pas trouvé
        return {
          success: true,
          recommendation: response,
          topChoice: 0,
          analysis: {},
          comparison: {},
          rawResponse: response
        };
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return {
        success: false,
        recommendation: "Analyse OpenAI disponible mais format de réponse inattendu",
        topChoice: 0,
        analysis: {},
        comparison: {},
        rawResponse: response,
        error: error.message
      };
    }
  }

  isConfigured() {
    return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here';
  }
}

export default OpenAIService;
