import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Limpa o banco para evitar duplicados ao rodar o seed novamente
  await prisma.book.deleteMany()

  await prisma.book.createMany({
    data: [
      {
        title: "A revolução dos bichos: Um conto de fadas",
        author: "George Orwell",
        description: "Escrita em plena Segunda Guerra Mundial e publicada em 1945 depois de ter sido rejeitada por várias editoras...",
        content: "De fato, são claras as referências: o despótico Napoleão seria Stálin, o banido Bola-de-Neve seria Trotsky...",
        publishedAt: new Date('1945-08-17'),
        coverUrl: "https://m.media-amazon.com/images/I/91Bs9XKuLdL.jpg"
      },
      {
        title: "Dom Casmurro",
        author: "Machado de Assis",
        description: "Bento Santiago retoma a infância que passou na Rua de Matacavalos e conta a história do amor e das desventuras que viveu com Capitu...",
        content: "Em Dom Casmurro, o narrador Bento Santiago retoma a infância... uma das personagens mais enigmáticas e intrigantes da literatura brasileira.",
        publishedAt: new Date('1899-01-01'),
        coverUrl: "https://m.media-amazon.com/images/I/81aY1lxkS9L.jpg"
      },
      {
        title: "O Senhor dos Anéis: A Sociedade do Anel",
        author: "J.R.R. Tolkien",
        description: "O volume inicial de O Senhor dos Anéis, lançado originalmente em julho de 1954...",
        content: "Foi o primeiro grande épico de fantasia moderno, conquistando milhões de leitores e se tornando o padrão de referência para todas as outras obras.",
        publishedAt: new Date('1954-07-29'),
        coverUrl: "https://m.media-amazon.com/images/I/81h6-176S6L.jpg"
      }
    ]
  })

  console.log('Banco de dados povoado com sucesso')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })