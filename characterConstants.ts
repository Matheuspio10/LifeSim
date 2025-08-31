import { Trait } from './types';

export const FIRST_NAMES: string[] = [
    // Nomes Masculinos
    'Miguel', 'Arthur', 'Gael', 'Heitor', 'Theo', 'Davi', 'Gabriel', 'Bernardo', 'Samuel', 'João',
    'Lucas', 'Pedro', 'Guilherme', 'Gustavo', 'Rafael', 'Felipe', 'Enzo', 'Nicolas', 'Matheus', 'Daniel',
    'Antônio', 'Carlos', 'Francisco', 'Marcos', 'Paulo', 'Roberto', 'Ricardo', 'Fernando', 'Jorge', 'Luiz',
    'André', 'Thiago', 'Marcelo', 'Bruno', 'Eduardo', 'Leonardo', 'Rodrigo', 'Diego', 'Vinicius', 'Caio',
    'Benício', 'Joaquim', 'Vicente', 'Augusto', 'Inácio', 'Estevão', 'Cristiano', 'Domingos', 'Gonçalo', 'Vasco',
    'Rui', 'Nuno', 'Diogo', 'Afonso', 'Tomás', 'Martim', 'Santiago', 'Lourenço', 'Simão', 'Igor',
    'Yuri', 'Alan', 'Alex', 'Kevin', 'Bryan', 'Christian', 'David', 'Eric', 'Henry', 'Ivan',
    // Nomes Femininos
    'Helena', 'Alice', 'Laura', 'Maria', 'Valentina', 'Sophia', 'Isabella', 'Heloísa', 'Lívia', 'Júlia',
    'Manuela', 'Luiza', 'Giovanna', 'Beatriz', 'Mariana', 'Yasmin', 'Gabriela', 'Rafaela', 'Isadora', 'Lorena',
    'Ana', 'Clara', 'Cecília', 'Elisa', 'Ester', 'Rebeca', 'Sarah', 'Amanda', 'Bianca', 'Carolina',
    'Fernanda', 'Letícia', 'Bruna', 'Camila', 'Juliana', 'Patrícia', 'Vanessa', 'Aline', 'Débora', 'Tainá',
    'Benedita', 'Catarina', 'Madalena', 'Francisca', 'Antónia', 'Inês', 'Leonor', 'Matilde', 'Margarida', 'Constança',
    'Sofia', 'Diana', 'Joana', 'Mafalda', 'Rita', 'Sara', 'Emily', 'Evelyn', 'Jessica', 'Jennifer',
    'Kelly', 'Kimberly', 'Melissa', 'Nicole', 'Olivia', 'Vitória', 'Larissa', 'Natália', 'Renata', 'Talita'
];

export const LAST_NAMES: string[] = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Carvalho', 'Ribeiro', 'Costa', 'Martins'
];

export const POSITIVE_TRAITS: Trait[] = [
    { name: 'Otimista', description: 'Você tende a ver o lado bom das coisas, recuperando-se mais rápido de contratempos.', type: 'positive' },
    { name: 'Inteligência Rápida', description: 'Você aprende novos conceitos rapidamente.', type: 'positive' },
    { name: 'Carismático', description: 'As pessoas são naturalmente atraídas por você.', type: 'positive' },
    { name: 'Resiliente', description: 'Você suporta dificuldades melhor do que a maioria.', type: 'positive' },
    { name: 'Criativo', description: 'Você tem um talento para pensar fora da caixa.', type: 'positive' },
    { name: 'Focado', description: 'É fácil para você se concentrar em uma tarefa por longos períodos, aumentando sua disciplina.', type: 'positive' },
    { name: 'Empático', description: 'Você entende e compartilha os sentimentos dos outros, melhorando seus relacionamentos.', type: 'positive' },
    { name: 'Ambição de Ferro', description: 'Você tem um desejo ardente de ter sucesso, o que impulsiona sua carreira.', type: 'positive' },
    { name: 'Constituição Forte', description: 'Sua saúde base é naturalmente mais alta e você adoece com menos frequência.', type: 'positive' },
    { name: 'Mente Aberta', description: 'Você está disposto a considerar novas ideias, o que acelera o ganho de inteligência e criatividade.', type: 'positive' },
    { name: 'Senso de Humor', description: 'Sua capacidade de fazer os outros rirem melhora suas interações sociais e alivia o estresse.', type: 'positive' },
    { name: 'Corajoso', description: 'Você enfrenta o perigo de frente, mesmo quando está com medo.', type: 'positive' },
    { name: 'Visionário', description: 'Você vê possibilidades onde outros veem apenas o status quo.', type: 'positive' },
    { name: 'Filantropo', description: 'Você é conhecido por sua generosidade e ganha influência por isso.', type: 'positive' },
];

export const NEGATIVE_TRAITS: Trait[] = [
    { name: 'Pessimista', description: 'Você muitas vezes espera o pior, o que pode afetar seu ânimo.', type: 'negative' },
    { name: 'Desajeitado', description: 'Pequenos acidentes parecem te seguir.', type: 'negative' },
    { name: 'Tímido', description: 'Interações sociais são um grande desafio para você.', type: 'negative' },
    { name: 'Preguiçoso', description: 'Você prefere o caminho de menor resistência, mesmo que não seja o melhor.', type: 'negative' },
    { name: 'Ansioso', description: 'Você se preocupa excessivamente com o futuro.', type: 'negative' },
    { name: 'Impulsivo', description: 'Você age por instinto, muitas vezes sem pensar nas consequências, levando a resultados imprevisíveis.', type: 'negative' },
    { name: 'Teimoso', description: 'É difícil mudar sua opinião, mesmo quando está errado, o que pode prejudicar relacionamentos e aprendizado.', type: 'negative' },
    { name: 'Procrastinador', description: 'Você tem o hábito de adiar tarefas importantes, o que afeta sua disciplina.', type: 'negative' },
    { name: 'Ingênuo', description: 'Você tende a acreditar facilmente nos outros, tornando-se um alvo fácil para enganos.', type: 'negative' },
    { name: 'Saúde Frágil', description: 'Sua constituição é delicada, tornando-o mais suscetível a doenças.', type: 'negative' },
    { name: 'Cínico', description: 'Você desconfia das motivações alheias, o que dificulta a formação de laços de confiança.', type: 'negative' },
    { name: 'Tendência a Vícios', description: 'Você é propenso a desenvolver hábitos compulsivos e vícios, de jogos a substâncias.', type: 'negative' },
    { name: 'Índole Criminosa', description: 'Você tem uma inclinação natural para resolver problemas através de meios ilegais e antiéticos.', type: 'negative' },
    { name: 'Paranoico', description: 'Você constantemente acha que os outros estão conspirando contra você, dificultando a confiança.', type: 'negative' },
    { name: 'Histórico Familiar Duvidoso', description: 'O passado da sua família é sombrio e pode voltar para te assombrar a qualquer momento.', type: 'negative' },
    { name: 'Distração Crônica', description: 'Sua mente está sempre em mil lugares, dificultando o foco em tarefas longas ou complexas.', type: 'negative' },
    { name: 'Reputação Manchada', description: 'O nome da sua família está na lama. Você precisa se esforçar em dobro para ganhar o respeito das pessoas.', type: 'negative' },
    { name: 'Coração Solitário', description: 'Sua infância te ensinou que o dinheiro é mais confiável que as pessoas, dificultando a criação de laços genuínos.', type: 'negative' },
    { name: 'Fardo das Expectativas', description: 'Sua família espera nada menos que a perfeição, e cada falha parece o fim do mundo.', type: 'negative' },
    { name: 'Solitário', description: 'Você se sente desconectado dos outros e prefere a própria companhia, mesmo que isso traga tristeza.', type: 'negative' },
    { name: 'Difícil de Levar a Sério', description: 'Seu humor constante, embora cativante, faz com que as pessoas duvidem de sua seriedade em momentos cruciais.', type: 'negative' },
    { name: 'Sob os Holofotes', description: 'Devido às suas conexões, a imprensa e os rivais políticos acompanham cada passo seu, prontos para explorar qualquer erro.', type: 'negative' },
    { name: 'Nostálgico', description: 'Você viveu em muitos lugares e, embora isso tenha enriquecido você, muitas vezes se sente um estranho, com saudades de um lar que não existe mais.', type: 'negative' },
    { name: 'Dívida de Gratidão', description: 'Você deve um grande favor a alguém poderoso. Um dia, a cobrança virá.', type: 'negative' },
    { name: 'Obrigações de Caridade', description: 'Sua filantropia exige atenção e recursos constantes, gerando estresse.', type: 'negative' },
    { name: 'Observado/Perseguido', description: 'Inimigos poderosos observam cada passo seu, prontos para agir.', type: 'negative' },
    { name: 'Socialmente Desajeitado', description: 'Sua disciplina extrema torna difícil criar conexões sociais genuínas.', type: 'negative' },
    { name: 'Paranormalmente Sensível', description: 'Você percebe coisas que outros não veem, o que pode ser perturbador.', type: 'negative' },
    { name: 'Trauma Herdado', description: 'Um peso de gerações passadas afeta sua felicidade e seus relacionamentos.', type: 'negative' },
    { name: 'Destino Sombrio', description: 'Uma sombra paira sobre seu futuro, prometendo um fim prematuro e trágico.', type: 'negative' },
];

export const PORTRAIT_COLORS = {
    hair: ['#422e37', '#75463b', '#222034', '#a36e44', '#f2d47e'],
    eyes: ['#222034', '#346524', '#663931', '#445a67', '#3c96cf']
};