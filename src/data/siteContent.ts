export const siteContent = {
  hero: {
    title: 'Sen Doğduğunda Gökyüzü, Bu şekilde gözüküyordu.',
    subtitle: '24 Haziran 2005',
    paragraph:
      'O gün gökyüzü bir yıldızı daha kazandı.',
    cta: 'Anı Defterine Geç',
  },
  navigation: [
    { label: 'Yıldız Haritası', href: '#star-map' },
    { label: 'Anı Defteri', href: '#memory-book' },
    { label: 'Oyunlar', href: '#games' },
  ],
  memory: {
    title: 'Anı Defteri',
    text: 'Her zaman var olacak güzel anılar.',
  },
  games: {
    title: 'Küçük Sürpriz Oyunları',
    text: 'Her oyun bir sonraki sürprizin kapısını açar.',
    finalMessage:
      'Dört sürprizi de tamamladın. Bugün senin günün, ama benim en güzel şansım sensin. İyi ki doğdun sevgilim.',
    items: [
      {
        id: 'jump',
        title: 'Kalbe Doğru',
        description: 'Yukarı doğru çık bakalım.',
        success:
          'Datluma bak be',
      },
      {
        id: 'cake',
        title: 'Pasta Peşinde',
        description: 'Küçük engelleri aş, pastaya doğru koş.',
        success:
          'Pastaya ulaştın ama en tatlı şey hâlâ sensin.',
      },
      {
        id: 'gift',
        title: 'Hediye Uçuşu',
        description: 'Kalp kapılarının arasından süzül ve hediyeye ulaş.',
        success:
          'Hediyeyi aldın. Ama benim en büyük hediyem sensin.',
      },
      {
        id: 'slingshot',
        title: 'Kalp Atışı',
        description: 'Nişan al, bırak ve kalbini tam hedefe gönder.',
        success: 'Kalbini tam hedefe gönderdin.',
      },
    ],
  },
} as const;
