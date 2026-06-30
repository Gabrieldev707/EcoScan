const EcoAlert = require('../models/EcoAlert');
const ecoAlertAnalysisService = require('../services/ecoAlertAnalysisService');

function buildAlertCode() {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(2, 12);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'ECO-' + stamp + '-' + suffix;
}

function toEcoAlertResponse(alert) {
  return {
    id: alert._id.toString(),
    alertCode: alert.alertCode,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    summary: alert.summary,
    detectedItems: alert.detectedItems,
    risks: alert.risks,
    recommendedAction: alert.recommendedAction,
    confidence: alert.confidence,
    city: alert.city,
    lat: alert.lat,
    lng: alert.lng,
    note: alert.note,
    imageProvided: alert.imageProvided,
    analysisSource: alert.analysisSource,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
  };
}

async function createEcoAlert(req, res, next) {
  try {
    const { city, lat, lng, note, image } = req.validated.body;
    const analysis = await ecoAlertAnalysisService.analyzeEcoAlert({ city, lat, lng, note, image });

    if (!analysis.isActionable) {
      const error = new Error('A foto nao parece mostrar um ponto de lixo que exija acao da cidade.');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }

    const alert = await EcoAlert.create({
      alertCode: buildAlertCode(),
      user: req.user._id,
      type: analysis.type,
      severity: analysis.severity,
      status: 'received',
      summary: analysis.summary,
      detectedItems: analysis.detectedItems,
      risks: analysis.risks,
      recommendedAction: analysis.recommendedAction,
      confidence: analysis.confidence,
      city,
      lat,
      lng,
      note,
      imageProvided: true,
      analysisSource: analysis.source,
    });

    res.status(201).json(toEcoAlertResponse(alert));
  } catch (error) {
    next(error);
  }
}

async function listEcoAlerts(req, res, next) {
  try {
    const { page, limit, status } = req.validated.query;
    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };

    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      EcoAlert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      EcoAlert.countDocuments(filter),
    ]);

    res.json({
      items: items.map(toEcoAlertResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createEcoAlert, listEcoAlerts, toEcoAlertResponse };
