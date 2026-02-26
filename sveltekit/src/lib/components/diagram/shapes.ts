import * as jointNamespace from '@joint/core';
const joint = (jointNamespace as any).default || jointNamespace;
const { shapes, util } = joint;

export const FlowchartProcess = shapes.standard.Rectangle.define('flowchart.Process', {
    attrs: {
        body: {
            rx: 12,
            ry: 12,
            fill: {
                type: 'linearGradient',
                stops: [
                    { offset: '0%', color: '#ffffff' },
                    { offset: '100%', color: '#f8fafc' }
                ]
            },
            stroke: '#cbd5e1',
            strokeWidth: 1.5,
            filter: {
                name: 'dropShadow',
                args: { dx: 0, dy: 2, blur: 4, color: 'rgba(0,0,0,0.05)' }
            }
        },
        label: {
            text: 'Process',
            fill: '#334155',
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif'
        }
    }
});

export const FlowchartDecision = shapes.standard.Polygon.define('flowchart.Decision', {
    attrs: {
        body: {
            refPoints: '50,0 100,50 50,100 0,50',
            fill: '#f0f9ff',
            stroke: '#3b82f6',
            strokeWidth: 2,
            filter: {
                name: 'dropShadow',
                args: { dx: 0, dy: 2, blur: 4, color: 'rgba(59,130,246,0.1)' }
            }
        },
        label: {
            text: 'Decision',
            fill: '#1e40af',
            fontSize: 11,
            fontWeight: '700',
            fontFamily: 'Inter, sans-serif'
        }
    }
});

export const FlowchartTerminal = shapes.standard.Rectangle.define('flowchart.Terminal', {
    attrs: {
        body: {
            rx: 24,
            ry: 24,
            fill: '#1e293b',
            stroke: 'none',
            filter: {
                name: 'dropShadow',
                args: { dx: 0, dy: 2, blur: 4, color: 'rgba(0,0,0,0.15)' }
            }
        },
        label: {
            text: 'Start/End',
            fill: '#ffffff',
            fontSize: 12,
            fontWeight: '800',
            fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: 1
        }
    }
});

export const FlowchartLink = shapes.standard.Link.define('flowchart.Link', {
    attrs: {
        line: {
            stroke: '#cbd5e1',
            strokeWidth: 2,
            targetMarker: {
                type: 'path',
                d: 'M 10 -5 0 0 10 5 z',
                fill: '#cbd5e1',
                stroke: 'none'
            }
        }
    },
    router: { name: 'manhattan', args: { padding: 20 } },
    connector: { name: 'rounded', args: { radius: 15 } },
    defaultLabel: {
        attrs: {
            rect: {
                fill: '#ffffff',
                stroke: '#cbd5e1',
                strokeWidth: 1,
                rx: 5,
                ry: 5
            },
            text: {
                fill: '#475569',
                fontSize: 10,
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif'
            }
        }
    }
});

export const UseCaseActor = shapes.standard.Path.define('usecase.Actor', {
    attrs: {
        body: {
            d: 'M 10 5 A 5 5 0 1 1 10 15 A 5 5 0 1 1 10 5 M 10 15 L 10 30 M 0 20 L 20 20 M 10 30 L 2 40 M 10 30 L 18 40',
            fill: 'none',
            stroke: '#1e293b',
            strokeWidth: 2,
            refX: 0,
            refY: 0
        },
        label: {
            text: 'Actor',
            fill: '#1e293b',
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            refY: '100%',
            refY2: 5,
            textAnchor: 'middle',
            refX: 10
        }
    }
});

export const UseCaseNode = shapes.standard.Ellipse.define('usecase.UseCase', {
    attrs: {
        body: {
            fill: '#ffffff',
            stroke: '#3b82f6',
            strokeWidth: 2
        },
        label: {
            text: 'Use Case',
            fill: '#1e293b',
            fontSize: 12,
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            textWrap: {
                width: -20,
                height: -10,
                ellipsis: true
            }
        }
    }
});

export const UseCaseLink = shapes.standard.Link.define('usecase.Link', {
    attrs: {
        line: {
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            targetMarker: null
        }
    }
});

export const UseCaseBoundary = shapes.standard.Rectangle.define('usecase.Boundary', {
    attrs: {
        body: {
            fill: 'rgba(248, 250, 252, 0.4)',
            stroke: '#cbd5e1',
            strokeWidth: 2,
            strokeDasharray: '5,5',
            rx: 15,
            ry: 15
        },
        label: {
            text: 'System Boundary',
            fill: '#64748b',
            fontSize: 14,
            fontWeight: '800',
            fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase',
            refY: 10,
            refX: 20,
            textAnchor: 'start'
        }
    }
});
