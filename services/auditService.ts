import { Character, AuditReport, GoalFinding, RelationshipFinding, PlotFinding, CohesionFinding, RelationshipType } from '../types';

const auditGoals = (character: Character): GoalFinding[] => {
    return character.lifeGoals.map(goal => {
        if (goal.completed) {
            return {
                description: goal.description,
                status: 'completed',
                recommendation: 'Esta meta já foi concluída com sucesso.'
            };
        }

        let isCompleted = false;
        const description = goal.description.toLowerCase();

        if (description.includes('viajar por diferentes países') && character.birthplace !== character.currentLocation) isCompleted = true;
        if (description.includes('viver livre de preocupações financeiras') && character.wealth > 250000) isCompleted = true;
        if (description.includes('dominar um instrumento musical') && character.skills.some(s => s.name === 'Música' && s.level >= 80)) isCompleted = true;
        if (description.includes('escrever um livro') && character.craftedItems.some(item => item.name.toLowerCase().includes('livro'))) isCompleted = true;
        if (description.includes('construir uma família') && character.relationships.some(r => r.status === 'Married')) isCompleted = true;
        if (description.includes('ser pai') || description.includes('ser mãe')) isCompleted = true;


        if (isCompleted) {
            return {
                description: goal.description,
                status: 'completed_unmarked',
                recommendation: 'Esta meta foi alcançada, mas não marcada como concluída. Aplicar a correção irá oficializar esta conquista.'
            };
        }

        return {
            description: goal.description,
            status: 'in_progress',
            recommendation: 'Continue trabalhando para alcançar este objetivo de vida.'
        };
    });
};

const auditRelationships = (character: Character): RelationshipFinding[] => {
    return character.relationships.map(rel => {
        if (rel.type === RelationshipType.FAMILY && rel.intimacy < 20) {
            return {
                name: rel.name,
                status: 'neglected',
                recommendation: `Sua relação com ${rel.name} (${rel.title}) está muito baixa. Considere focar em 'Tempo com a Família' para reconectar-se.`
            };
        }
        if (rel.status === 'Dating' && rel.intimacy > 70) {
            return {
                name: rel.name,
                status: 'opportunity',
                recommendation: `Seu relacionamento com ${rel.name} é muito forte. Talvez seja o momento para um passo adiante, como um pedido de casamento.`
            };
        }
        if (rel.type === RelationshipType.RIVAL && rel.intimacy < -50 && (!rel.history || rel.history.length === 0)) {
             return {
                name: rel.name,
                status: 'stale_rivalry',
                recommendation: `Sua rivalidade com ${rel.name} está adormecida. Um confronto direto pode ser necessário para resolver as coisas.`
            };
        }
        return {
            name: rel.name,
            status: 'healthy',
            recommendation: 'Este relacionamento parece estável no momento.'
        };
    });
};

const auditPlots = (character: Character): PlotFinding[] => {
    if (!character.ongoingPlots || character.ongoingPlots.length === 0) {
        return [];
    }
    return character.ongoingPlots.map(plot => {
        if (!plot.description || plot.description.trim() === '') {
            return {
                description: 'Trama Inválida/Vazia',
                status: 'bugged',
                recommendation: 'Esta entrada de trama está vazia devido a um erro. Recomenda-se aplicar a correção para removê-la.'
            };
        }
        if (plot.completed) {
             return {
                description: plot.description,
                status: 'completed',
                recommendation: 'Esta trama foi concluída.'
            };
        }
        return {
            description: plot.description,
            status: 'in_progress',
            recommendation: 'Esta trama está em andamento. Continue a história para ver o desfecho.'
        };
    });
};

const auditCohesion = (character: Character): CohesionFinding[] => {
    const findings: CohesionFinding[] = [];

    // Check for high ambition but low career progress
    if (character.traits.some(t => t.name === 'Ambição de Ferro') && character.careerLevel < 30 && character.age > 25) {
        findings.push({
            area: 'Carreira',
            status: 'inconsistent',
            recommendation: 'Você tem o traço "Ambição de Ferro", mas sua carreira não decolou. Considere focar mais no trabalho.'
        });
    }

    // Check for empathy but many bad relationships
    if (character.traits.some(t => t.name === 'Empático') && character.relationships.filter(r => r.intimacy < 0).length > 2) {
        findings.push({
            area: 'Social',
            status: 'inconsistent',
            recommendation: 'Apesar de ser "Empático", você tem vários relacionamentos ruins. Talvez uma reavaliação de suas amizades seja necessária.'
        });
    }
    
     // Check for high stress and no coping traits/hobbies
    if (character.stress > 70 && !character.skills.some(s => ['Arte', 'Música', 'Esportes'].includes(s.name))) {
        findings.push({
            area: 'Bem-estar',
            status: 'inconsistent',
            recommendation: 'Seu nível de estresse está muito alto. Desenvolver um hobby relaxante como arte, música ou esportes pode ajudar a controlá-lo.'
        });
    }
    
     // Check for criminal trait but high morality
    if (character.traits.some(t => t.name === 'Índole Criminosa') && character.morality > 20) {
        findings.push({
            area: 'Moralidade',
            status: 'inconsistent',
            recommendation: 'Você tem "Índole Criminosa", mas age de forma ética. Você está lutando contra sua natureza ou passando por uma redenção?'
        });
    }

    if (findings.length === 0) {
        findings.push({
            area: 'Geral',
            status: 'ok',
            recommendation: 'A vida do seu personagem parece narrativamente coesa no momento.'
        });
    }

    return findings;
}

export const runCharacterAudit = (character: Character): AuditReport => {
    const goalFindings = auditGoals(character);
    const plotFindings = auditPlots(character);

    const fixesAvailable = 
        goalFindings.filter(f => f.status === 'completed_unmarked').length +
        plotFindings.filter(f => f.status === 'bugged').length;

    return {
        goals: goalFindings,
        relationships: auditRelationships(character),
        plots: plotFindings,
        cohesion: auditCohesion(character),
        fixesAvailable,
    };
};
