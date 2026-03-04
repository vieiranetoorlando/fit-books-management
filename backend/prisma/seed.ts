import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.book.deleteMany();

  await prisma.book.createMany({
    data: [
      {
        title: 'A revolucao dos bichos: Um conto de fadas',
        author: 'George Orwell',
        description:
          'Escrita em plena Segunda Guerra Mundial e publicada em 1945 depois de ter sido rejeitada por varias editoras, essa pequena narrativa causou desconforto ao satirizar ferozmente a ditadura stalinista numa epoca em que os sovieticos ainda eram aliados do Ocidente na luta contra o eixo nazifascista.\n\nDe fato, sao claras as referencias: o despotico Napoleao seria Stalin, o banido Bola-de-Neve seria Trotsky, e os eventos politicos - expurgos, instituicao de um estado policial, deturpacao tendenciosa da Historia - mimetizam os que estavam em curso na Uniao Sovietica.\n\nCom o acirramento da Guerra Fria, as mesmas razoes que causaram constrangimento na epoca de sua publicacao levaram A revolucao dos bichos a ser amplamente usada pelo Ocidente nas decadas seguintes como arma ideologica contra o comunismo. O proprio Orwell, adepto do socialismo e inimigo de qualquer forma de manipulacao politica, sentiu-se incomodado com a utilizacao de sua fabula como panfleto.\n\nDepois das profundas transformacoes politicas que mudaram a fisionomia do planeta nas ultimas decadas, a pequena obra-prima de Orwell pode ser vista sem o vies ideologico reducionista. Mais de sessenta anos depois de escrita, ela mantem o vico e o brilho de uma alegoria perene sobre as fraquezas humanas que levam a corrosao dos grandes projetos de revolucao politica. E ironico que o escritor, para fazer esse retrato cruel da humanidade, tenha recorrido aos animais como personagens. De certo modo, a inteligencia politica que humaniza seus bichos e a mesma que animaliza os homens.\n\nEscrito com perfeito dominio da narrativa, atencao as minucias e extraordinaria capacidade de criacao de personagens e situacoes, A revolucao dos bichos combina de maneira feliz duas ricas tradicoes literarias: a das fabulas morais, que remontam a Esopo, e a da satira politica, que teve talvez em Jonathan Swift seu representante maximo.',
        content: null,
        publishedAt: new Date('1945-08-17'),
        coverUrl: '/uploads/seed/a-revolucao-dos-bichos.jpg',
      },
      {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        description:
          'Bento Santiago retoma a infancia que passou na Rua de Matacavalos e conta a historia do amor e das desventuras que viveu com Capitu...',
        content:
          'Em Dom Casmurro, o narrador Bento Santiago retoma a infancia... uma das personagens mais enigmaticas e intrigantes da literatura brasileira.',
        publishedAt: new Date('1899-01-01'),
        coverUrl: '/uploads/seed/dom-casmurro.jpg',
      },
      {
        title: 'O Senhor dos Aneis: A Sociedade do Anel',
        author: 'J.R.R. Tolkien',
        description:
          'O volume inicial de O Senhor dos Aneis, lancado originalmente em julho de 1954...',
        content:
          'Foi o primeiro grande epico de fantasia moderno, conquistando milhoes de leitores e se tornando referencia para outras obras.',
        publishedAt: new Date('1954-07-29'),
        coverUrl: '/uploads/seed/o-senhor-dos-aneis-a-sociedade-do-anel.jpg',
      },
      {
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        description:
          'Um classico direto ao ponto sobre os fundamentos mais solidos da linguagem JavaScript.',
        content:
          'O livro separa os recursos mais robustos da linguagem e mostra como escrever codigo mais claro, previsivel e facil de manter.',
        publishedAt: new Date('2008-05-01'),
        coverUrl: '/uploads/seed/javascript-the-good-parts.jpg',
      },
    ],
  });

  console.log('Seed executado com sucesso.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
