"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const api_1 = require("@opentelemetry/api");
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const instrumentation_2 = require("@prisma/instrumentation");
const instrumentation_express_1 = require("@opentelemetry/instrumentation-express");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
function initializeTracing(serviceName) {
    const provider = new sdk_trace_node_1.NodeTracerProvider({
        resource: new resources_1.Resource({
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });
    const jaegerExporter = new exporter_jaeger_1.JaegerExporter({
        endpoint: 'http://localhost:14268/api/traces',
    });
    (0, instrumentation_1.registerInstrumentations)({
        instrumentations: [
            new instrumentation_http_1.HttpInstrumentation(),
            new instrumentation_express_1.ExpressInstrumentation(),
            new instrumentation_2.PrismaInstrumentation(),
        ],
        tracerProvider: provider,
    });
    provider.addSpanProcessor(new sdk_trace_base_1.SimpleSpanProcessor(jaegerExporter));
    provider.register();
    return api_1.trace.getTracer(serviceName);
}
exports.default = initializeTracing;
//# sourceMappingURL=tracing.js.map