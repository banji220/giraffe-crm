/**
 * 365 curated Bible verses for door knockers — one for every day of the year.
 * Each verse has a theme, scripture text, and a personal reflection
 * written specifically for someone who knocks doors for a living.
 *
 * Rotation: day-of-year mod 365 → never repeats within a calendar year.
 */

export interface BibleVerse {
  reference: string
  text: string
  theme: string
  reflection: string
}

export const VERSES: BibleVerse[] = [
  // ═══════════════════════════════════════════════════════════
  // COURAGE (1–30)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Joshua 1:9',
    text: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.',
    theme: 'Courage',
    reflection: 'Every door is unknown territory. The person behind it might slam it, ignore it, or change your whole day. Walk up anyway. He is already there.',
  },
  {
    reference: 'Isaiah 41:10',
    text: 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.',
    theme: 'Courage',
    reflection: 'That first knock of the day is always the hardest. Your hands might hesitate. But you are held by hands that never shake.',
  },
  {
    reference: '2 Timothy 1:7',
    text: 'For God gave us a spirit not of fear but of power and love and self-control.',
    theme: 'Courage',
    reflection: 'Rejection is not the opposite of success — fear is. You were given power to knock, love to serve, and self-control to keep going when every fiber says quit.',
  },
  {
    reference: 'Deuteronomy 31:6',
    text: 'Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you.',
    theme: 'Courage',
    reflection: 'That intimidating house at the end of the cul-de-sac? He walks ahead of you up that driveway. You are never the first one there.',
  },
  {
    reference: 'Psalm 27:1',
    text: 'The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?',
    theme: 'Courage',
    reflection: 'The angry homeowner. The barking dog. The "no soliciting" sign. None of it changes who walks with you.',
  },
  {
    reference: 'Psalm 56:3',
    text: 'When I am afraid, I put my trust in you.',
    theme: 'Courage',
    reflection: 'Short verse. Simple truth. When the nerves hit — and they will — redirect them upward.',
  },
  {
    reference: 'Isaiah 43:1',
    text: 'Fear not, for I have redeemed you; I have called you by name, you are mine.',
    theme: 'Courage',
    reflection: 'You introduce yourself at every door. But you were already known by name before you started this work.',
  },
  {
    reference: 'Psalm 118:6',
    text: 'The Lord is on my side; I will not fear. What can man do to me?',
    theme: 'Courage',
    reflection: 'The worst thing a homeowner can do is say no. That\'s it. A "no" can\'t define you when the Lord already has.',
  },
  {
    reference: 'Romans 8:31',
    text: 'If God is for us, who can be against us?',
    theme: 'Courage',
    reflection: 'Competitors. Cheap DIYers. Rude homeowners. None of it matters when the math is this simple.',
  },
  {
    reference: 'Psalm 31:24',
    text: 'Be strong, and let your heart take courage, all you who wait for the Lord!',
    theme: 'Courage',
    reflection: 'Waiting for the door to open requires its own kind of courage. Stand tall in those three seconds.',
  },
  {
    reference: 'Isaiah 35:4',
    text: 'Say to those who have an anxious heart, "Be strong; fear not! Behold, your God will come."',
    theme: 'Courage',
    reflection: 'Your heart races before the first door every morning. That\'s not weakness — that\'s where faith meets action.',
  },
  {
    reference: 'Deuteronomy 31:8',
    text: 'It is the Lord who goes before you. He will be with you; he will not leave you or forsake you. Do not fear or be dismayed.',
    theme: 'Courage',
    reflection: 'He goes before you. That means by the time you knock, the groundwork is already laid.',
  },
  {
    reference: '1 Chronicles 28:20',
    text: 'Be strong and courageous and do it. Do not be afraid and do not be dismayed, for the Lord God is with you.',
    theme: 'Courage',
    reflection: 'Notice the middle part: "and do it." Courage without action is just a nice thought. Knock the door.',
  },
  {
    reference: 'Psalm 46:1',
    text: 'God is our refuge and strength, a very present help in trouble.',
    theme: 'Courage',
    reflection: 'When the neighborhood turns hostile or the day falls apart — He\'s not distant. He\'s very present. Right there on the sidewalk with you.',
  },
  {
    reference: 'Acts 4:29',
    text: 'And now, Lord, look upon their threats and grant to your servants to continue to speak your word with all boldness.',
    theme: 'Courage',
    reflection: 'The early church asked for boldness to keep going despite threats. You\'re asking for the same thing every morning you lace up and head out.',
  },
  {
    reference: 'Proverbs 28:1',
    text: 'The wicked flee when no one pursues, but the righteous are bold as a lion.',
    theme: 'Courage',
    reflection: 'Lions don\'t apologize for showing up. Walk to that door like you belong there — because you do.',
  },
  {
    reference: 'Numbers 14:9',
    text: 'Do not fear the people of the land, for they are bread for us. Their protection is removed from them, and the Lord is with us; do not fear them.',
    theme: 'Courage',
    reflection: 'The gated community. The HOA neighborhood. The houses with three cars in the driveway. None of them are too big for you.',
  },
  {
    reference: 'Psalm 23:4',
    text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.',
    theme: 'Courage',
    reflection: 'Some streets feel like valleys. Dark neighborhoods, hostile vibes. But you walk through, not around. And you\'re not alone.',
  },
  {
    reference: 'Hebrews 13:6',
    text: 'So we can confidently say, "The Lord is my helper; I will not fear; what can man do to me?"',
    theme: 'Courage',
    reflection: 'Confidence at the door isn\'t arrogance. It\'s the overflow of knowing whose help you carry.',
  },
  {
    reference: '2 Chronicles 20:15',
    text: 'Do not be afraid and do not be dismayed at this great horde, for the battle is not yours but God\'s.',
    theme: 'Courage',
    reflection: 'When the task list is long and the territory is massive, remember: you show up, but He fights.',
  },
  {
    reference: 'Psalm 112:7',
    text: 'He is not afraid of bad news; his heart is firm, trusting in the Lord.',
    theme: 'Courage',
    reflection: 'The quote that fell through. The customer who cancelled. Bad news will come. A firm heart doesn\'t flinch.',
  },
  {
    reference: 'Isaiah 54:4',
    text: 'Fear not, for you will not be ashamed; be not confounded, for you will not be disgraced.',
    theme: 'Courage',
    reflection: 'Some people look at door-to-door and see something beneath them. God looks at your work and sees faithfulness.',
  },
  {
    reference: 'Exodus 14:13',
    text: 'Fear not, stand firm, and see the salvation of the Lord, which he will work for you today.',
    theme: 'Courage',
    reflection: 'Today. Not someday. Stand firm at the next door and watch what He does with your obedience today.',
  },
  {
    reference: 'John 14:27',
    text: 'Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.',
    theme: 'Courage',
    reflection: 'The world says peace comes after the sale closes. His peace is available before you even knock.',
  },
  {
    reference: 'Zephaniah 3:17',
    text: 'The Lord your God is in your midst, a mighty one who will save; he will rejoice over you with gladness.',
    theme: 'Courage',
    reflection: 'He\'s not just watching from a distance. He\'s in your midst — on the street, at the door, in the conversation. And He\'s glad you showed up.',
  },
  {
    reference: 'Nahum 1:7',
    text: 'The Lord is good, a stronghold in the day of trouble; he knows those who take refuge in him.',
    theme: 'Courage',
    reflection: 'Bad days on the doors don\'t catch Him off guard. He already knows, and He\'s already your stronghold.',
  },
  {
    reference: 'Psalm 34:4',
    text: 'I sought the Lord, and he answered me and delivered me from all my fears.',
    theme: 'Courage',
    reflection: 'All your fears. Not just the big ones. The small fear of looking foolish at a door — He handles that one too.',
  },
  {
    reference: '1 John 4:18',
    text: 'There is no fear in love, but perfect love casts out fear.',
    theme: 'Courage',
    reflection: 'If you genuinely love serving people, the fear of rejection loses its grip. Love the homeowner before you pitch them.',
  },
  {
    reference: 'Mark 5:36',
    text: 'Do not fear, only believe.',
    theme: 'Courage',
    reflection: 'Five words. The simplest instruction for the hardest moments. Believe the next door matters.',
  },
  {
    reference: 'Psalm 27:14',
    text: 'Wait for the Lord; be strong, and let your heart take courage; wait for the Lord!',
    theme: 'Courage',
    reflection: 'Sometimes courage looks like patience — waiting for the right moment, the right street, the right season. Strength isn\'t always speed.',
  },

  // ═══════════════════════════════════════════════════════════
  // PERSEVERANCE (31–70)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Galatians 6:9',
    text: 'And let us not grow weary of doing good, for in due season we will reap, if we do not give up.',
    theme: 'Perseverance',
    reflection: 'Door 47 feels the same as door 1, but the harvest doesn\'t. Every knock is a seed. The ones who win are the ones who don\'t stop planting.',
  },
  {
    reference: 'James 1:12',
    text: 'Blessed is the man who remains steadfast under trial, for when he has stood the test he will receive the crown of life.',
    theme: 'Perseverance',
    reflection: 'The sun is brutal. The "no"s pile up. But steadfastness in the hard hours is what separates you from everyone who quit this work.',
  },
  {
    reference: 'Romans 5:3-4',
    text: 'We rejoice in our sufferings, knowing that suffering produces endurance, and endurance produces character, and character produces hope.',
    theme: 'Perseverance',
    reflection: 'That rough neighborhood you just finished? It didn\'t just build your pipeline — it built you. The grind is the training ground.',
  },
  {
    reference: 'Hebrews 12:1',
    text: 'Let us run with endurance the race that is set before us.',
    theme: 'Perseverance',
    reflection: 'The race isn\'t a sprint from door to door. It\'s the long game — showing up, day after day, street after street, until the territory knows your name.',
  },
  {
    reference: 'James 1:2-4',
    text: 'Count it all joy, my brothers, when you meet trials of various kinds, for you know that the testing of your faith produces steadfastness.',
    theme: 'Perseverance',
    reflection: 'The door that slammed. The customer who ghosted. The rain that started mid-route. Count it joy — each trial is forging something in you.',
  },
  {
    reference: '2 Corinthians 4:8-9',
    text: 'We are afflicted in every way, but not crushed; perplexed, but not driven to despair; persecuted, but not forsaken; struck down, but not destroyed.',
    theme: 'Perseverance',
    reflection: 'Knocked down is not knocked out. A bad day doesn\'t define your week. A bad week doesn\'t define your quarter. Get back up.',
  },
  {
    reference: 'Romans 8:28',
    text: 'And we know that for those who love God all things work together for good.',
    theme: 'Perseverance',
    reflection: 'The dead-end streets. The wasted drives. The neighborhoods that went nowhere. All of it is working toward something you can\'t see yet.',
  },
  {
    reference: '1 Corinthians 15:58',
    text: 'Therefore, my beloved brothers, be steadfast, immovable, always abounding in the work of the Lord, knowing that in the Lord your labor is not in vain.',
    theme: 'Perseverance',
    reflection: 'Not in vain. Those three words should echo in your head after every zero-lead day. No knock is wasted.',
  },
  {
    reference: 'Hebrews 10:36',
    text: 'For you have need of endurance, so that when you have done the will of God you may receive what is promised.',
    theme: 'Perseverance',
    reflection: 'The promise comes after the endurance, not before it. Keep going — the reward is on the other side of the grind.',
  },
  {
    reference: 'Philippians 3:14',
    text: 'I press on toward the goal for the prize of the upward call of God in Christ Jesus.',
    theme: 'Perseverance',
    reflection: 'Press on. Not drift. Not coast. Press. There\'s intention behind every step Paul took, and there should be behind every door you knock.',
  },
  {
    reference: 'Romans 12:12',
    text: 'Rejoice in hope, be patient in tribulation, be constant in prayer.',
    theme: 'Perseverance',
    reflection: 'Three instructions for the field: hope when the pipeline is dry, patience when the doors are cold, prayer when you\'re between streets.',
  },
  {
    reference: '2 Thessalonians 3:13',
    text: 'As for you, brothers, do not grow weary in doing good.',
    theme: 'Perseverance',
    reflection: 'Simple and direct. Don\'t stop. The weariness is real but the work is good. Keep knocking.',
  },
  {
    reference: 'Psalm 126:5',
    text: 'Those who sow in tears shall reap with shouts of joy!',
    theme: 'Perseverance',
    reflection: 'Some days you sow in frustration, exhaustion, doubt. But the harvest doesn\'t care about your mood when you planted — it just grows.',
  },
  {
    reference: 'Habakkuk 2:3',
    text: 'For still the vision awaits its appointed time; it hastens to the end — it will not lie. If it seems slow, wait for it; it will surely come.',
    theme: 'Perseverance',
    reflection: 'Your vision for this business has a timeline. It might feel slow. But it\'s not late — it\'s right on time.',
  },
  {
    reference: 'Psalm 37:7',
    text: 'Be still before the Lord and wait patiently for him.',
    theme: 'Perseverance',
    reflection: 'Between knocks, between neighborhoods, between seasons — there are moments to be still. Patience on the doors is a discipline.',
  },
  {
    reference: 'Isaiah 40:29',
    text: 'He gives power to the faint, and to him who has no might he increases strength.',
    theme: 'Perseverance',
    reflection: 'That moment at 2pm when your energy crashes and the doors aren\'t opening? That\'s exactly when He specializes.',
  },
  {
    reference: 'Hebrews 6:12',
    text: 'So that you may not be sluggish, but imitators of those who through faith and patience inherit the promises.',
    theme: 'Perseverance',
    reflection: 'Faith gets you to the neighborhood. Patience keeps you there when the first ten doors say no.',
  },
  {
    reference: 'Psalm 40:1',
    text: 'I waited patiently for the Lord; he inclined to me and heard my cry.',
    theme: 'Perseverance',
    reflection: 'He hears the quiet prayer you say walking between houses. He hears the frustration in the car after a rough street. He inclines.',
  },
  {
    reference: 'Micah 7:7',
    text: 'But as for me, I will look to the Lord; I will wait for the God of my salvation; my God will hear me.',
    theme: 'Perseverance',
    reflection: '"But as for me" — everyone else might quit this line of work. But as for you, you look up and keep moving.',
  },
  {
    reference: 'Psalm 27:13',
    text: 'I believe that I shall look upon the goodness of the Lord in the land of the living!',
    theme: 'Perseverance',
    reflection: 'Not in some distant afterlife — in the land of the living. On this street. In this neighborhood. Today. Believe that goodness is coming.',
  },
  {
    reference: 'Ecclesiastes 11:6',
    text: 'In the morning sow your seed, and at evening withhold not your hand, for you do not know which will prosper, this or that, or whether both alike will be good.',
    theme: 'Perseverance',
    reflection: 'Morning doors or evening doors — you never know which knock becomes the deal. So don\'t stop. Work both shifts.',
  },
  {
    reference: 'Proverbs 24:16',
    text: 'For the righteous falls seven times and rises again.',
    theme: 'Perseverance',
    reflection: 'Seven rejections? Seven lost quotes? Seven wasted drives? Rise again. The falling doesn\'t define you — the rising does.',
  },
  {
    reference: 'Matthew 24:13',
    text: 'But the one who endures to the end will be saved.',
    theme: 'Perseverance',
    reflection: 'The end of the street. The end of the day. The end of the slow season. Endure through all of them.',
  },
  {
    reference: 'Job 17:9',
    text: 'Yet the righteous holds to his way, and he who has clean hands grows stronger and stronger.',
    theme: 'Perseverance',
    reflection: 'Hold your way. Do honest work, charge fair prices, show up when you say you will. That integrity compounds.',
  },
  {
    reference: '2 Corinthians 4:16',
    text: 'So we do not lose heart. Though our outer self is wasting away, our inner self is being renewed day by day.',
    theme: 'Perseverance',
    reflection: 'Your body is tired from the miles. Your spirit is being built by the obedience. Don\'t lose heart.',
  },
  {
    reference: 'Psalm 30:5',
    text: 'Weeping may tarry for the night, but joy comes with the morning.',
    theme: 'Perseverance',
    reflection: 'A bad day has an expiration date. Tomorrow morning the slate is clean and the doors are fresh.',
  },
  {
    reference: 'Revelation 2:10',
    text: 'Be faithful unto death, and I will give you the crown of life.',
    theme: 'Perseverance',
    reflection: 'Faithfulness in the small things — showing up, being consistent, honoring your word. That\'s what earns the crown.',
  },
  {
    reference: 'Isaiah 30:15',
    text: 'In returning and rest you shall be saved; in quietness and in trust shall be your strength.',
    theme: 'Perseverance',
    reflection: 'Not every day needs to be a 60-door marathon. Some days the most faithful thing is to rest and trust.',
  },
  {
    reference: 'Psalm 73:26',
    text: 'My flesh and my heart may fail, but God is the strength of my heart and my portion forever.',
    theme: 'Perseverance',
    reflection: 'Your energy will fail. Your motivation will dip. But He doesn\'t run out, and He\'s your portion — not the commission.',
  },
  {
    reference: 'Hebrews 12:11',
    text: 'For the moment all discipline seems painful rather than pleasant, but later it yields the peaceful fruit of righteousness.',
    theme: 'Perseverance',
    reflection: 'The daily grind of 50 doors is discipline. It\'s painful now. But the fruit — the business, the freedom, the impact — that\'s coming.',
  },

  // ═══════════════════════════════════════════════════════════
  // PURPOSE & CALLING (71–110)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Colossians 3:23',
    text: 'Whatever you do, work heartily, as for the Lord and not for men.',
    theme: 'Purpose',
    reflection: 'You\'re not just cleaning windows. You\'re serving families, building something real, and doing it with excellence. That\'s worship with a squeegee.',
  },
  {
    reference: 'Proverbs 16:3',
    text: 'Commit your work to the Lord, and your plans will be established.',
    theme: 'Purpose',
    reflection: 'Before you map your route, commit it. Before you knock, pray over the street. The plan is yours, but the establishment is His.',
  },
  {
    reference: 'Jeremiah 29:11',
    text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
    theme: 'Purpose',
    reflection: 'This business isn\'t an accident. Every door you knock is part of a bigger blueprint — one designed for your flourishing, not just your survival.',
  },
  {
    reference: 'Ephesians 2:10',
    text: 'For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them.',
    theme: 'Purpose',
    reflection: 'The doors you knock today were prepared for you before you chose this career. You\'re walking in works already laid out.',
  },
  {
    reference: '1 Peter 4:10',
    text: 'As each has received a gift, use it to serve one another, as good stewards of God\'s varied grace.',
    theme: 'Purpose',
    reflection: 'Your gift might be the pitch, the hustle, the ability to read people at the door. Whatever it is — it\'s meant to serve, not just sell.',
  },
  {
    reference: 'Proverbs 22:29',
    text: 'Do you see a man skillful in his work? He will stand before kings; he will not stand before obscure men.',
    theme: 'Purpose',
    reflection: 'Master your craft. The pitch, the quote, the close, the service. Skill opens doors that connections can\'t.',
  },
  {
    reference: 'Romans 12:6',
    text: 'Having gifts that differ according to the grace given to us, let us use them.',
    theme: 'Purpose',
    reflection: 'Not everyone can walk up to a stranger\'s door and start a conversation. That\'s a gift. Use it.',
  },
  {
    reference: 'Ecclesiastes 9:10',
    text: 'Whatever your hand finds to do, do it with your might.',
    theme: 'Purpose',
    reflection: 'Half-hearted knocks get half-hearted results. Whatever your hand finds — this door, this street, this hour — give it everything.',
  },
  {
    reference: '1 Corinthians 10:31',
    text: 'So, whether you eat or drink, or whatever you do, do all to the glory of God.',
    theme: 'Purpose',
    reflection: 'Even the mundane — driving to the neighborhood, filling out the quote, following up for the third time — all of it can glorify Him.',
  },
  {
    reference: 'Psalm 90:17',
    text: 'Let the favor of the Lord our God be upon us, and establish the work of our hands upon us; yes, establish the work of our hands!',
    theme: 'Purpose',
    reflection: 'This is the prayer before you start: Lord, establish what my hands are about to do. Make it count. Make it last.',
  },
  {
    reference: 'Proverbs 12:24',
    text: 'The hand of the diligent will rule, while the slothful will be put to forced labor.',
    theme: 'Purpose',
    reflection: 'You chose this. Nobody forces you to knock. Diligence is freedom — you rule your territory because you earned it.',
  },
  {
    reference: 'Colossians 3:17',
    text: 'And whatever you do, in word or deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him.',
    theme: 'Purpose',
    reflection: 'Your pitch, your handshake, your follow-up text. All of it in His name. Gratitude changes how you carry yourself at the door.',
  },
  {
    reference: '2 Timothy 2:15',
    text: 'Do your best to present yourself to God as one approved, a worker who has no need to be ashamed, rightly handling the word of truth.',
    theme: 'Purpose',
    reflection: 'No need to be ashamed of your work. You\'re a skilled worker doing honest labor. Present yourself with approval, not apology.',
  },
  {
    reference: 'Proverbs 14:23',
    text: 'In all toil there is profit, but mere talk leads only to poverty.',
    theme: 'Purpose',
    reflection: 'Talk about knocking 50 doors or actually knock them. Planning is nice. Knocking is profit.',
  },
  {
    reference: 'Matthew 5:16',
    text: 'Let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.',
    theme: 'Purpose',
    reflection: 'Your work is visible. The clean windows, the honest quote, the reliable service — that light shines to every homeowner on the block.',
  },
  {
    reference: 'Psalm 37:5',
    text: 'Commit your way to the Lord; trust in him, and he will act.',
    theme: 'Purpose',
    reflection: 'Commit the route, trust the process, and watch Him move. Your job is commitment. His job is action.',
  },
  {
    reference: 'Proverbs 16:9',
    text: 'The heart of man plans his way, but the Lord establishes his steps.',
    theme: 'Purpose',
    reflection: 'You plan the route on your phone. He establishes which doors open. Plan well, then surrender the outcome.',
  },
  {
    reference: 'Isaiah 6:8',
    text: 'And I heard the voice of the Lord saying, "Whom shall I send, and who will go for us?" Then I said, "Here I am! Send me."',
    theme: 'Purpose',
    reflection: 'Every morning is an answer to that question. Here I am. Send me to the next neighborhood. Send me to the next door.',
  },
  {
    reference: 'Titus 3:14',
    text: 'And let our people learn to devote themselves to good works, so as to help cases of urgent need, and not be unfruitful.',
    theme: 'Purpose',
    reflection: 'Devoted to good work. Not occasional. Not when it\'s convenient. Devoted. That\'s the word for what you do.',
  },
  {
    reference: '1 Thessalonians 4:11',
    text: 'Aspire to live quietly, and to mind your own affairs, and to work with your hands.',
    theme: 'Purpose',
    reflection: 'Work with your hands. Simple, honest, tangible. There\'s dignity in this work that no desk job can replicate.',
  },
  {
    reference: 'Psalm 128:2',
    text: 'You shall eat the fruit of the labor of your hands; you shall be blessed, and it shall be well with you.',
    theme: 'Purpose',
    reflection: 'The fruit of your hands — your deals, your business, your income — it\'s the direct result of showing up. And it\'s blessed.',
  },
  {
    reference: 'Proverbs 31:17',
    text: 'She dresses herself with strength and makes her arms strong.',
    theme: 'Purpose',
    reflection: 'Strength for the work isn\'t accidental — it\'s dressed on. Prepare yourself physically, mentally, spiritually. Then go.',
  },
  {
    reference: 'Genesis 2:15',
    text: 'The Lord God took the man and put him in the garden of Eden to work it and keep it.',
    theme: 'Purpose',
    reflection: 'Work was part of the original design — before the fall, before the curse. Your territory is your garden. Tend it well.',
  },
  {
    reference: 'Acts 20:35',
    text: 'It is more blessed to give than to receive.',
    theme: 'Purpose',
    reflection: 'At the door, you\'re giving: a clean home, a solved problem, a fair price. The sale is a byproduct of generosity.',
  },
  {
    reference: 'Proverbs 10:4',
    text: 'A slack hand causes poverty, but the hand of the diligent makes rich.',
    theme: 'Purpose',
    reflection: 'Diligence is the only hack. No shortcut. No trick. Show up more, knock more, follow up more. The hand that works gets paid.',
  },
  {
    reference: '2 Corinthians 9:8',
    text: 'And God is able to make all grace abound to you, so that having all sufficiency in all things at all times, you may abound in every good work.',
    theme: 'Purpose',
    reflection: 'All sufficiency in all things at all times. That\'s the coverage. You have enough grace for today\'s doors.',
  },
  {
    reference: 'Nehemiah 4:6',
    text: 'So we built the wall. And all the wall was joined together to half its height, for the people had a mind to work.',
    theme: 'Purpose',
    reflection: 'They had a mind to work. That mentality — that decision before the alarm goes off — is what builds empires, brick by brick.',
  },
  {
    reference: 'Psalm 19:14',
    text: 'Let the words of my mouth and the meditation of my heart be acceptable in your sight, O Lord.',
    theme: 'Purpose',
    reflection: 'Your pitch is words from your mouth. Your strategy is meditation of your heart. Let both be acceptable — honest, helpful, true.',
  },
  {
    reference: 'Proverbs 21:5',
    text: 'The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to want.',
    theme: 'Purpose',
    reflection: 'Plan your route. Study the neighborhood. Prepare your pitch. Diligent planning beats frantic hustle every time.',
  },
  {
    reference: 'Colossians 4:5',
    text: 'Walk in wisdom toward outsiders, making the best use of the time.',
    theme: 'Purpose',
    reflection: 'Every homeowner is an outsider to your business until you make them an insider. Wise words at the door. Best use of the time. No wasted minutes.',
  },

  // ═══════════════════════════════════════════════════════════
  // PROVISION & TRUST (111–155)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Philippians 4:19',
    text: 'And my God will supply every need of yours according to his riches in glory in Christ Jesus.',
    theme: 'Provision',
    reflection: 'Slow days happen. The pipeline looks thin. But your provider isn\'t your pipeline — He owns the cattle on a thousand hills, and He knows what you need.',
  },
  {
    reference: 'Matthew 6:33',
    text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
    theme: 'Provision',
    reflection: 'Seek first. Not after the leads dry up. Not when the bank account drops. First. The deals will follow the devotion.',
  },
  {
    reference: 'Psalm 37:25',
    text: 'I have been young, and now am old, yet I have not seen the righteous forsaken or his children begging for bread.',
    theme: 'Provision',
    reflection: 'The hustle is real, but the worry is a lie. Do the work. Knock the doors. He has never left a faithful worker stranded.',
  },
  {
    reference: 'Matthew 6:26',
    text: 'Look at the birds of the air: they neither sow nor reap nor gather into barns, and yet your heavenly Father feeds them. Are you not of more value than they?',
    theme: 'Provision',
    reflection: 'You sow AND reap AND gather — you\'re out there working. If He feeds the birds who don\'t, how much more will He provide for you who do?',
  },
  {
    reference: 'Psalm 34:10',
    text: 'The young lions suffer want and hunger; but those who seek the Lord lack no good thing.',
    theme: 'Provision',
    reflection: 'Even lions go hungry. But those who seek Him — who pray before they knock — lack nothing they truly need.',
  },
  {
    reference: 'Psalm 23:1',
    text: 'The Lord is my shepherd; I shall not want.',
    theme: 'Provision',
    reflection: 'Six words that silence every anxiety about pipeline, cash flow, and slow seasons. You shall not want.',
  },
  {
    reference: 'Deuteronomy 8:18',
    text: 'You shall remember the Lord your God, for it is he who gives you power to get wealth.',
    theme: 'Provision',
    reflection: 'The power to close, the instinct to read people, the drive to knock 50 doors — that ability is given, not self-made.',
  },
  {
    reference: 'Luke 12:24',
    text: 'Consider the ravens: they neither sow nor reap, they have neither storehouse nor barn, and yet God feeds them. Of how much more value are you than the birds!',
    theme: 'Provision',
    reflection: 'You have a storehouse — your CRM, your pipeline, your follow-up list. You do the work. He does the providing.',
  },
  {
    reference: 'Malachi 3:10',
    text: 'Bring the full tithe into the storehouse, and thereby put me to the test, says the Lord of hosts, if I will not open the windows of heaven and pour down for you a blessing.',
    theme: 'Provision',
    reflection: 'He literally says test me on this. Give faithfully and watch the windows of heaven open. The only area He invites you to test Him.',
  },
  {
    reference: 'Proverbs 3:9-10',
    text: 'Honor the Lord with your wealth and with the firstfruits of all your produce; then your barns will be filled with plenty.',
    theme: 'Provision',
    reflection: 'Firstfruits, not leftovers. Honor Him with the first deal\'s earnings, not what\'s left after expenses. Watch what happens next.',
  },
  {
    reference: 'Psalm 65:11',
    text: 'You crown the year with your bounty; your wagon tracks overflow with abundance.',
    theme: 'Provision',
    reflection: 'The year isn\'t crowned on January 1st. It\'s crowned with what you build door by door, month by month. And it overflows.',
  },
  {
    reference: '2 Corinthians 9:10',
    text: 'He who supplies seed to the sower and bread for food will supply and multiply your seed for sowing and increase the harvest of your righteousness.',
    theme: 'Provision',
    reflection: 'He supplies the seed — the next lead, the next opportunity. Your job is to sow it. His job is to multiply it.',
  },
  {
    reference: 'Psalm 145:15-16',
    text: 'The eyes of all look to you, and you give them their food in due season. You open your hand; you satisfy the desire of every living thing.',
    theme: 'Provision',
    reflection: 'In due season. Not your timeline — His. But it comes. And when His hand opens, it satisfies completely.',
  },
  {
    reference: 'Proverbs 10:22',
    text: 'The blessing of the Lord makes rich, and he adds no sorrow with it.',
    theme: 'Provision',
    reflection: 'The right kind of wealth — earned through honest work, blessed by God — comes without the anxiety that hustle-culture wealth brings.',
  },
  {
    reference: 'Genesis 22:14',
    text: 'So Abraham called the name of that place, "The Lord will provide."',
    theme: 'Provision',
    reflection: 'Jehovah Jireh. He provided for Abraham on a mountain. He\'ll provide for you on a doorstep.',
  },
  {
    reference: 'Matthew 7:11',
    text: 'If you then, who are evil, know how to give good gifts to your children, how much more will your Father who is in heaven give good things to those who ask him!',
    theme: 'Provision',
    reflection: 'Ask. Before you start the car, before you pull up the map, before the first knock — ask Him for a good day. He loves to give.',
  },
  {
    reference: 'Psalm 84:11',
    text: 'For the Lord God is a sun and shield; the Lord bestows favor and honor. No good thing does he withhold from those who walk uprightly.',
    theme: 'Provision',
    reflection: 'Walk upright — honest quotes, fair prices, real follow-through. He withholds no good thing from that kind of worker.',
  },
  {
    reference: 'Luke 6:38',
    text: 'Give, and it will be given to you. Good measure, pressed down, shaken together, running over, will be put into your lap.',
    theme: 'Provision',
    reflection: 'Give value first. Give a homeowner your time, your expertise, your honest assessment. Watch what gets poured back.',
  },
  {
    reference: 'Philippians 4:6',
    text: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.',
    theme: 'Provision',
    reflection: 'Anxious about making the numbers this month? That anxiety is an invitation to pray, not a reason to panic.',
  },
  {
    reference: 'Psalm 37:4',
    text: 'Delight yourself in the Lord, and he will give you the desires of your heart.',
    theme: 'Provision',
    reflection: 'Delight first, desires second. When your joy comes from Him, the things your heart wants start aligning with what He\'s already preparing.',
  },
  {
    reference: 'Isaiah 58:11',
    text: 'And the Lord will guide you continually and satisfy your desire in scorched places.',
    theme: 'Provision',
    reflection: 'Scorched places — the hot streets, the dry leads, the barren neighborhoods. Even there, He satisfies.',
  },
  {
    reference: 'Matthew 6:31-32',
    text: 'Therefore do not be anxious, saying, "What shall we eat?" or "What shall we drink?" For your heavenly Father knows that you need them all.',
    theme: 'Provision',
    reflection: 'He knows. Before you check the bank account, before you count the leads — He already knows what you need.',
  },
  {
    reference: 'Psalm 121:1-2',
    text: 'I lift up my eyes to the hills. From where does my help come? My help comes from the Lord, who made heaven and earth.',
    theme: 'Provision',
    reflection: 'Between houses, look up. Your help isn\'t in the next door — it\'s from the one who made everything behind every door.',
  },
  {
    reference: 'Proverbs 11:25',
    text: 'Whoever brings blessing will be enriched, and one who waters will himself be watered.',
    theme: 'Provision',
    reflection: 'Bless the homeowner with a fair quote. Water them with excellent service. You\'ll be enriched in return — that\'s the promise.',
  },
  {
    reference: 'Joel 2:25',
    text: 'I will restore to you the years that the swarming locust has eaten.',
    theme: 'Provision',
    reflection: 'Lost time. Wasted seasons. Neighborhoods that went nowhere. He restores years, not just days. The comeback is bigger than the setback.',
  },

  // ═══════════════════════════════════════════════════════════
  // STRENGTH & POWER (156–195)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Philippians 4:13',
    text: 'I can do all things through him who strengthens me.',
    theme: 'Strength',
    reflection: 'Not some things. All things. The 100-degree day. The 60-door stretch with zero leads. The drive to a neighborhood you\'ve never worked. All of it.',
  },
  {
    reference: 'Isaiah 40:31',
    text: 'But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.',
    theme: 'Strength',
    reflection: 'Your legs are tired. Your voice is hoarse. But the strength to knock one more door doesn\'t come from an energy drink — it comes from the source.',
  },
  {
    reference: 'Psalm 18:32',
    text: 'The God who equipped me with strength and made my way blameless.',
    theme: 'Strength',
    reflection: 'You didn\'t equip yourself for this work. The boldness to approach strangers, the resilience to hear "no" — that was given to you. Use it.',
  },
  {
    reference: 'Psalm 46:10',
    text: 'Be still, and know that I am God.',
    theme: 'Strength',
    reflection: 'Between the hustle and the grind, pause. Be still for 30 seconds in the car. Know who\'s really running this operation.',
  },
  {
    reference: 'Ephesians 6:10',
    text: 'Finally, be strong in the Lord and in the strength of his might.',
    theme: 'Strength',
    reflection: 'Your might gets you to 30 doors. His might gets you to 60. Tap into the bigger strength.',
  },
  {
    reference: 'Psalm 28:7',
    text: 'The Lord is my strength and my shield; in him my heart trusts, and I am helped.',
    theme: 'Strength',
    reflection: 'Shield against discouragement. Strength for the next block. Trust for the outcome. All from one source.',
  },
  {
    reference: 'Psalm 29:11',
    text: 'May the Lord give strength to his people! May the Lord bless his people with peace!',
    theme: 'Strength',
    reflection: 'Strength AND peace. Not just grinding power but calm confidence. That\'s what you carry to the door.',
  },
  {
    reference: 'Isaiah 41:13',
    text: 'For I, the Lord your God, hold your right hand; it is I who say to you, "Fear not, I am the one who helps you."',
    theme: 'Strength',
    reflection: 'The hand that knocks is held by His hand. Think about that next time your fist hits the door.',
  },
  {
    reference: 'Psalm 138:3',
    text: 'On the day I called, you answered me; my strength of soul you increased.',
    theme: 'Strength',
    reflection: 'Soul strength — the kind that doesn\'t show on the outside but keeps you going when everything says stop. He increases it when you call.',
  },
  {
    reference: '2 Samuel 22:33',
    text: 'This God is my strong refuge and has made my way blameless.',
    theme: 'Strength',
    reflection: 'When the day breaks you down, He\'s the refuge. Sit in the car, catch your breath, let Him be the strong place for a moment.',
  },
  {
    reference: 'Nehemiah 8:10',
    text: 'The joy of the Lord is your strength.',
    theme: 'Strength',
    reflection: 'Not caffeine. Not willpower. Not motivation. Joy. The deep kind that doesn\'t depend on how many doors opened today.',
  },
  {
    reference: 'Habakkuk 3:19',
    text: 'God, the Lord, is my strength; he makes my feet like the deer\'s; he makes me tread on the high places.',
    theme: 'Strength',
    reflection: 'Feet like a deer\'s — sure-footed on uneven ground. The ability to navigate any neighborhood, any conversation, any objection.',
  },
  {
    reference: 'Psalm 18:39',
    text: 'For you equipped me with strength for the battle; you made those who rise against me sink under me.',
    theme: 'Strength',
    reflection: 'Equipped for the battle. Not stumbling into it unprepared. He gave you what you need for today\'s fight.',
  },
  {
    reference: 'Exodus 15:2',
    text: 'The Lord is my strength and my song, and he has become my salvation.',
    theme: 'Strength',
    reflection: 'Strength for the work and song for the drive between neighborhoods. Both come from the same source.',
  },
  {
    reference: 'Psalm 68:35',
    text: 'Awesome is God from his sanctuary; the God of Israel — he is the one who gives power and strength to his people.',
    theme: 'Strength',
    reflection: 'Power and strength — both given, not earned. You received them so you could give your best to every door.',
  },
  {
    reference: '1 Peter 5:10',
    text: 'And after you have suffered a little while, the God of all grace will himself restore, confirm, strengthen, and establish you.',
    theme: 'Strength',
    reflection: 'Restore after the bad day. Confirm after the doubt. Strengthen after the exhaustion. Establish after the uncertainty. He does all four.',
  },
  {
    reference: 'Psalm 73:26',
    text: 'My flesh and my heart may fail, but God is the strength of my heart and my portion forever.',
    theme: 'Strength',
    reflection: 'When your body says done and your heart says quit — He becomes both your strength and your reward.',
  },
  {
    reference: 'Zechariah 4:6',
    text: 'Not by might, nor by power, but by my Spirit, says the Lord of hosts.',
    theme: 'Strength',
    reflection: 'Your hustle matters, but the breakthrough? That\'s Spirit work. You can\'t muscle your way to every deal.',
  },
  {
    reference: 'Psalm 18:29',
    text: 'For by you I can run against a troop, and by my God I can leap over a wall.',
    theme: 'Strength',
    reflection: 'Gated community? No problem. Locked neighborhood? Find a way. By Him, you leap over every barrier.',
  },
  {
    reference: 'Psalm 147:3',
    text: 'He heals the brokenhearted and binds up their wounds.',
    theme: 'Strength',
    reflection: 'A string of rejections can bruise your heart. Let Him bind it up before you knock the next one.',
  },

  // ═══════════════════════════════════════════════════════════
  // WISDOM & DISCERNMENT (196–240)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'James 1:5',
    text: 'If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.',
    theme: 'Wisdom',
    reflection: 'Which street to hit. How to read the homeowner. When to push and when to walk away. Ask for wisdom before you ask for the sale.',
  },
  {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    theme: 'Wisdom',
    reflection: 'Your instincts are good, but your understanding is limited. That neighborhood you almost skipped? That door you almost didn\'t knock? Trust the nudge.',
  },
  {
    reference: 'Proverbs 2:6',
    text: 'For the Lord gives wisdom; from his mouth come knowledge and understanding.',
    theme: 'Wisdom',
    reflection: 'Wisdom to price right, to read body language, to know when the homeowner is close to a yes — that\'s a gift from above.',
  },
  {
    reference: 'Proverbs 4:7',
    text: 'The beginning of wisdom is this: Get wisdom, and whatever you get, get insight.',
    theme: 'Wisdom',
    reflection: 'After every door, ask: what did I learn? The wise knocker gets better every day because he studies every interaction.',
  },
  {
    reference: 'Proverbs 15:22',
    text: 'Without counsel plans fail, but with many advisers they succeed.',
    theme: 'Wisdom',
    reflection: 'Don\'t isolate. Talk to other salespeople. Learn from the best closers. Counsel makes your plan bulletproof.',
  },
  {
    reference: 'Proverbs 18:15',
    text: 'An intelligent heart acquires knowledge, and the ear of the wise seeks knowledge.',
    theme: 'Wisdom',
    reflection: 'Listen more at the door. The homeowner will tell you everything you need to close — if you have ears to hear it.',
  },
  {
    reference: 'Proverbs 19:20',
    text: 'Listen to advice and accept instruction, that you may gain wisdom in the future.',
    theme: 'Wisdom',
    reflection: 'The criticism you got from that last customer? It stings, but instruction is gold. Accept it. Adjust. Get wiser.',
  },
  {
    reference: 'Proverbs 1:7',
    text: 'The fear of the Lord is the beginning of knowledge; fools despise wisdom and instruction.',
    theme: 'Wisdom',
    reflection: 'The starting point isn\'t a sales book or a YouTube video. It\'s reverence. Everything else builds on that foundation.',
  },
  {
    reference: 'Ecclesiastes 7:12',
    text: 'For the protection of wisdom is like the protection of money, and the advantage of knowledge is that wisdom preserves the life of him who has it.',
    theme: 'Wisdom',
    reflection: 'Wisdom protects your business like capital does. Knowing which neighborhoods to skip saves you as much as knowing which ones to hit.',
  },
  {
    reference: 'Proverbs 11:14',
    text: 'Where there is no guidance, a people falls, but in an abundance of counselors there is safety.',
    theme: 'Wisdom',
    reflection: 'Your CRM is a counselor. Your data is a counselor. Your conversion rates whisper which streets to revisit. Listen.',
  },
  {
    reference: 'Proverbs 13:20',
    text: 'Whoever walks with the wise becomes wise, but the companion of fools will suffer harm.',
    theme: 'Wisdom',
    reflection: 'The people you hang around shape your hustle. Walk with builders. Avoid the ones who talk big but never knock.',
  },
  {
    reference: 'Proverbs 24:3-4',
    text: 'By wisdom a house is built, and by understanding it is established; by knowledge the rooms are filled with all precious and pleasant riches.',
    theme: 'Wisdom',
    reflection: 'Your business is a house being built. Wisdom builds the foundation. Understanding fills the pipeline. Knowledge fills the bank account.',
  },
  {
    reference: 'Proverbs 27:12',
    text: 'The prudent sees danger and hides himself, but the simple go on and suffer for it.',
    theme: 'Wisdom',
    reflection: 'That neighborhood with zero conversions and hostile responses? The wise salesman pivots. Don\'t keep knocking a dead zone out of stubbornness.',
  },
  {
    reference: 'Proverbs 20:18',
    text: 'Plans are established by counsel; by wise guidance wage war.',
    theme: 'Wisdom',
    reflection: 'Your route plan, your pricing strategy, your follow-up cadence — all of it improves with wise counsel. Don\'t wing it.',
  },
  {
    reference: 'Daniel 2:21',
    text: 'He gives wisdom to the wise and knowledge to those who have understanding.',
    theme: 'Wisdom',
    reflection: 'Wisdom compounds. The more you learn at the door, the more He gives. Every interaction is a deposit in your wisdom account.',
  },
  {
    reference: 'Proverbs 16:16',
    text: 'How much better to get wisdom than gold! To get understanding is to be chosen rather than silver.',
    theme: 'Wisdom',
    reflection: 'Chase wisdom over commission. The salesman who understands people will always out-earn the one who only chases dollars.',
  },
  {
    reference: 'Psalm 119:105',
    text: 'Your word is a lamp to my feet and a light to my path.',
    theme: 'Wisdom',
    reflection: 'You don\'t need to see the whole quarter\'s pipeline. Just enough light for the next step, the next street, the next door.',
  },
  {
    reference: 'Proverbs 9:10',
    text: 'The fear of the Lord is the beginning of wisdom, and the knowledge of the Holy One is insight.',
    theme: 'Wisdom',
    reflection: 'Insight into people, into timing, into neighborhoods — it starts with something deeper than analytics. It starts with reverence.',
  },
  {
    reference: 'Proverbs 3:13',
    text: 'Blessed is the one who finds wisdom, and the one who gets understanding.',
    theme: 'Wisdom',
    reflection: 'Blessed — not just informed, but genuinely blessed. When you understand your territory and your customers, doors open that force can\'t.',
  },
  {
    reference: 'Colossians 2:3',
    text: 'In whom are hidden all the treasures of wisdom and knowledge.',
    theme: 'Wisdom',
    reflection: 'Every sales technique is a shadow of something deeper. The source of all wisdom — including how to serve people at their doors — is Him.',
  },
  {
    reference: 'Proverbs 12:15',
    text: 'The way of a fool is right in his own eyes, but a wise man listens to advice.',
    theme: 'Wisdom',
    reflection: 'Your gut says this neighborhood is gold. Your data says otherwise. The wise man listens to the data.',
  },
  {
    reference: 'Proverbs 17:24',
    text: 'The discerning sets his face toward wisdom, but the eyes of a fool are on the ends of the earth.',
    theme: 'Wisdom',
    reflection: 'Focus. Don\'t chase every shiny neighborhood. Set your face toward the zones that your data says convert. Discernment over distraction.',
  },
  {
    reference: 'Psalm 32:8',
    text: 'I will instruct you and teach you in the way you should go; I will counsel you with my eye upon you.',
    theme: 'Wisdom',
    reflection: 'He counsels with His eye on you — not a generic playbook, but specific guidance for your situation, your territory, your day.',
  },
  {
    reference: 'Proverbs 8:11',
    text: 'For wisdom is better than jewels, and all that you may desire cannot compare with her.',
    theme: 'Wisdom',
    reflection: 'A $500 deal is nice. The wisdom to replicate that deal 100 times across your territory? That\'s worth more than any single close.',
  },
  {
    reference: 'Isaiah 11:2',
    text: 'And the Spirit of the Lord shall rest upon him, the Spirit of wisdom and understanding.',
    theme: 'Wisdom',
    reflection: 'Invite that Spirit to rest on you before the first knock. Wisdom for the pitch. Understanding for the person behind the door.',
  },

  // ═══════════════════════════════════════════════════════════
  // FRESH START & RENEWAL (241–275)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Lamentations 3:22-23',
    text: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.',
    theme: 'Fresh Start',
    reflection: 'Yesterday\'s zero-lead day is gone. This morning is brand new mercy. New streets, new doors, new chances. Lace up and go.',
  },
  {
    reference: 'Isaiah 43:18-19',
    text: 'Remember not the former things, nor consider the things of old. Behold, I am doing a new thing; now it springs forth, do you not perceive it?',
    theme: 'Fresh Start',
    reflection: 'Stop replaying last week\'s failures. Something new is springing up in your territory — a new zone, a new customer, a new rhythm. See it.',
  },
  {
    reference: '2 Corinthians 5:17',
    text: 'Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.',
    theme: 'Fresh Start',
    reflection: 'The old you who was afraid of doors is gone. The new you knows whose strength you carry. Walk different.',
  },
  {
    reference: 'Psalm 51:10',
    text: 'Create in me a clean heart, O God, and renew a right spirit within me.',
    theme: 'Fresh Start',
    reflection: 'Before the first knock, clean the heart. Drop yesterday\'s frustration. Renew the spirit that approaches each door with genuine care.',
  },
  {
    reference: 'Romans 12:2',
    text: 'Do not be conformed to this world, but be transformed by the renewal of your mind.',
    theme: 'Fresh Start',
    reflection: 'The world says door-to-door is dead. Renew your mind. Your approach, your tools, your hustle — they\'re different. You\'re not conforming.',
  },
  {
    reference: 'Ezekiel 36:26',
    text: 'And I will give you a new heart, and a new spirit I will put within you.',
    theme: 'Fresh Start',
    reflection: 'A new heart for the work. Not the jaded, beat-up heart of last month. A fresh one. Ask for it.',
  },
  {
    reference: 'Psalm 103:5',
    text: 'Who satisfies you with good so that your youth is renewed like the eagle\'s.',
    theme: 'Fresh Start',
    reflection: 'Renewed like an eagle — fresh energy, sharp vision, soaring perspective. That\'s available every morning you ask for it.',
  },
  {
    reference: 'Revelation 21:5',
    text: 'And he who was seated on the throne said, "Behold, I am making all things new."',
    theme: 'Fresh Start',
    reflection: 'All things. Including your mindset, your energy, your approach to that same neighborhood you\'ve knocked three times. He makes it new.',
  },
  {
    reference: 'Psalm 118:24',
    text: 'This is the day that the Lord has made; let us rejoice and be glad in it.',
    theme: 'Fresh Start',
    reflection: 'He made today. Not a random Tuesday — a specific, crafted, intentional day with doors meant for you to knock. Rejoice in it.',
  },
  {
    reference: 'Isaiah 40:30-31',
    text: 'Even youths shall faint and be weary, and young men shall fall exhausted; but they who wait for the Lord shall renew their strength.',
    theme: 'Fresh Start',
    reflection: 'Even the young and strong burn out. Renewal isn\'t about age — it\'s about source. Wait on Him for five minutes before you start.',
  },
  {
    reference: 'Jeremiah 31:25',
    text: 'For I will satisfy the weary soul, and every languishing soul I will replenish.',
    theme: 'Fresh Start',
    reflection: 'Weary from the miles. Languishing from the "no"s. He replenishes. Sit for a moment. Let Him refill the tank.',
  },
  {
    reference: 'Psalm 23:3',
    text: 'He restores my soul. He leads me in paths of righteousness for his name\'s sake.',
    theme: 'Fresh Start',
    reflection: 'A restored soul walks different — more confident, more patient, more genuine at the door. Let Him restore before you knock.',
  },
  {
    reference: 'Titus 3:5',
    text: 'He saved us, not because of works done by us in righteousness, but according to his own mercy, by the washing of regeneration and renewal of the Holy Spirit.',
    theme: 'Fresh Start',
    reflection: 'Renewal isn\'t earned by grinding harder. It\'s received by mercy. Accept the fresh start — you don\'t have to hustle your way to it.',
  },
  {
    reference: 'Psalm 92:14',
    text: 'They still bear fruit in old age; they are ever full of sap and green.',
    theme: 'Fresh Start',
    reflection: 'The veteran knocker doesn\'t dry up — he gets greener. Experience plus renewal equals someone who still bears fruit year after year.',
  },
  {
    reference: 'Job 8:7',
    text: 'And though your beginning was small, your latter days will be very great.',
    theme: 'Fresh Start',
    reflection: 'Small start? Good. Small means you learned everything by doing it yourself. Your latter days are being built right now, one door at a time.',
  },
  {
    reference: 'Philippians 1:6',
    text: 'And I am sure of this, that he who began a good work in you will bring it to completion at the day of Jesus Christ.',
    theme: 'Fresh Start',
    reflection: 'He started this work in you. He\'s not going to leave it half-finished. The business, the growth, the calling — He\'ll complete it.',
  },
  {
    reference: 'Psalm 30:11',
    text: 'You have turned for me my mourning into dancing; you have loosed my sackcloth and clothed me with gladness.',
    theme: 'Fresh Start',
    reflection: 'The mourning of a terrible week can turn into the dancing of a breakthrough Monday. He flips seasons faster than you expect.',
  },
  {
    reference: 'Isaiah 61:3',
    text: 'To grant to those who mourn in Zion — to give them a beautiful headdress instead of ashes, the oil of gladness instead of mourning, the mantle of praise instead of a faint spirit.',
    theme: 'Fresh Start',
    reflection: 'Beauty for ashes. That burnt-out feeling from last season? Trade it in. He offers gladness and praise where fatigue used to sit.',
  },
  {
    reference: 'Psalm 126:5-6',
    text: 'Those who sow in tears shall reap with shouts of joy! He who goes out weeping, bearing the seed for sowing, shall come home with shouts of joy.',
    theme: 'Fresh Start',
    reflection: 'Go out — even when it\'s hard, even when it hurts. Take the seed. Knock the doors. You\'re coming home with joy.',
  },
  {
    reference: 'Hosea 6:3',
    text: 'Let us press on to know the Lord; his going out is sure as the dawn; he will come to us as the showers, as the spring rains that water the earth.',
    theme: 'Fresh Start',
    reflection: 'Sure as the dawn. His faithfulness isn\'t uncertain. Press on knowing that the rain is coming — the deals, the breakthroughs, the harvest.',
  },
  {
    reference: 'Psalm 143:8',
    text: 'Let me hear in the morning of your steadfast love, for in you I trust. Make me know the way I should go.',
    theme: 'Fresh Start',
    reflection: 'Morning prayer for a door knocker: Let me hear your love. I trust you. Show me where to go today.',
  },
  {
    reference: 'Micah 7:8',
    text: 'Rejoice not over me, O my enemy; when I fall, I shall rise; when I sit in darkness, the Lord will be a light to me.',
    theme: 'Fresh Start',
    reflection: 'Competition celebrating your slow week? Let them. You rise. Darkness is temporary. His light is already switching on.',
  },
  {
    reference: 'Psalm 57:8',
    text: 'Awake, my glory! Awake, O harp and lyre! I will awake the dawn!',
    theme: 'Fresh Start',
    reflection: 'Don\'t wait for motivation. Awake the dawn. Be the first one out, the first one knocking, the one who starts the day instead of reacting to it.',
  },
  {
    reference: 'Isaiah 42:9',
    text: 'Behold, the former things have come to pass, and new things I now declare; before they spring forth I tell you of them.',
    theme: 'Fresh Start',
    reflection: 'He declares new things before they happen. That feeling that something good is coming? It might be Him telling you what\'s next.',
  },
  {
    reference: 'Psalm 5:3',
    text: 'O Lord, in the morning you hear my voice; in the morning I prepare a sacrifice for you and watch.',
    theme: 'Fresh Start',
    reflection: 'Morning voice. Morning preparation. Then watch — watch what He does with a day that started in prayer.',
  },

  // ═══════════════════════════════════════════════════════════
  // ABUNDANCE & BLESSING (276–310)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Ephesians 3:20',
    text: 'Now to him who is able to do far more abundantly than all that we ask or think, according to the power at work within us.',
    theme: 'Abundance',
    reflection: 'You\'re planning for 5 deals this week. He\'s planning for something you haven\'t imagined yet. Stay open. Keep knocking. The abundance is coming.',
  },
  {
    reference: 'John 10:10',
    text: 'I came that they may have life and have it abundantly.',
    theme: 'Abundance',
    reflection: 'Abundant life isn\'t just about revenue. It\'s the freedom to build your own schedule, serve people directly, and own every result. You\'re living it.',
  },
  {
    reference: 'Deuteronomy 28:12',
    text: 'The Lord will open to you his good treasury, the heavens, to give the rain to your land in its season and to bless all the work of your hands.',
    theme: 'Abundance',
    reflection: 'In its season. Rain doesn\'t fall all year. But when it\'s your season, He opens the treasury. Be ready to work when it pours.',
  },
  {
    reference: 'Psalm 16:11',
    text: 'You make known to me the path of life; in your presence there is fullness of joy; at your right hand are pleasures forevermore.',
    theme: 'Abundance',
    reflection: 'Fullness of joy — not the hollow kind from closing a deal, but the deep kind from walking a path He designed for you.',
  },
  {
    reference: 'Psalm 36:8',
    text: 'They feast on the abundance of your house, and you give them drink from the river of your delights.',
    theme: 'Abundance',
    reflection: 'Abundance flows like a river, not a drip. Position yourself in the current — knock consistently, follow up faithfully — and drink deep.',
  },
  {
    reference: '2 Kings 4:6',
    text: 'When the vessels were full, she said to her son, "Bring me another vessel." And he said to her, "There is not another." Then the oil stopped flowing.',
    theme: 'Abundance',
    reflection: 'The oil flowed until the vessels ran out. Your pipeline expands to match your capacity. Keep adding vessels — more doors, more follow-ups, more territory.',
  },
  {
    reference: 'Deuteronomy 30:9',
    text: 'The Lord your God will make you abundantly prosperous in all the work of your hand.',
    theme: 'Abundance',
    reflection: 'Abundantly prosperous in the work of your hand. Not in theory. In actual work. His blessing multiplies the effort you put in.',
  },
  {
    reference: 'Psalm 67:6',
    text: 'The earth has yielded its increase; God, our God, shall bless us.',
    theme: 'Abundance',
    reflection: 'The territory yields its increase. The knock count produces leads. The leads produce deals. He blesses the system you built.',
  },
  {
    reference: 'Proverbs 28:25',
    text: 'Whoever trusts in the Lord will be enriched.',
    theme: 'Abundance',
    reflection: 'Short and absolute. Trust = enrichment. Not just financially, but in experience, wisdom, relationships, and purpose.',
  },
  {
    reference: 'Psalm 1:3',
    text: 'He is like a tree planted by streams of water that yields its fruit in its season, and its leaf does not wither. In all that he does, he prospers.',
    theme: 'Abundance',
    reflection: 'Planted — not wandering. Pick your territory, root yourself, and bear fruit. The tree that keeps moving never grows deep enough to produce.',
  },
  {
    reference: 'Genesis 26:12',
    text: 'And Isaac sowed in that land and reaped in the same year a hundredfold. The Lord blessed him.',
    theme: 'Abundance',
    reflection: 'A hundredfold. Isaac didn\'t leave the land when it was hard. He sowed in famine territory and reaped beyond expectation.',
  },
  {
    reference: 'John 15:5',
    text: 'I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit.',
    theme: 'Abundance',
    reflection: 'Much fruit — not a little. The branch doesn\'t strain to produce. It just stays connected. Abide first, knock second.',
  },
  {
    reference: 'Psalm 115:14',
    text: 'May the Lord give you increase, you and your children!',
    theme: 'Abundance',
    reflection: 'Increase. Not just maintenance. Not just survival. Growth — in your territory, your revenue, your impact.',
  },
  {
    reference: 'Proverbs 13:11',
    text: 'Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.',
    theme: 'Abundance',
    reflection: 'Little by little. Door by door. Deal by deal. The slow build is the one that lasts. Stop looking for shortcuts.',
  },
  {
    reference: 'Psalm 85:12',
    text: 'Yes, the Lord will give what is good, and our land will yield its increase.',
    theme: 'Abundance',
    reflection: 'Your land — your territory — will yield its increase. Work it faithfully, and it gives back more than you planted.',
  },
  {
    reference: 'Luke 5:6',
    text: 'And when they had done this, they enclosed a large number of fish, and their nets were breaking.',
    theme: 'Abundance',
    reflection: 'Nets breaking from overflow. Sometimes the blessing is so big your systems can\'t hold it. That\'s a good problem. Scale up.',
  },
  {
    reference: 'Matthew 13:23',
    text: 'As for what was sown on good soil, this is the one who hears the word and understands it. He indeed bears fruit and yields, in one case a hundredfold.',
    theme: 'Abundance',
    reflection: 'Good soil neighborhoods exist. Your job is to find them and sow. The yield on good territory is exponential.',
  },
  {
    reference: 'Proverbs 13:4',
    text: 'The soul of the sluggard craves and gets nothing, while the soul of the diligent is richly supplied.',
    theme: 'Abundance',
    reflection: 'Craving deals without knocking doors is sluggard energy. Richly supplied means showing up and doing the work.',
  },
  {
    reference: '3 John 1:2',
    text: 'Beloved, I pray that all may go well with you and that you may be in good health, as it goes well with your soul.',
    theme: 'Abundance',
    reflection: 'Body, soul, business — all connected. Take care of your soul and watch everything else follow.',
  },
  {
    reference: 'Psalm 112:3',
    text: 'Wealth and riches are in his house, and his righteousness endures forever.',
    theme: 'Abundance',
    reflection: 'Wealth built on righteousness — honest work, fair prices, genuine service. That kind of wealth has staying power.',
  },

  // ═══════════════════════════════════════════════════════════
  // HUMILITY & SERVICE (311–340)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Philippians 2:3',
    text: 'Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves.',
    theme: 'Humility',
    reflection: 'At the door, the homeowner matters more than the sale. When they feel that — genuinely feel that — the sale follows naturally.',
  },
  {
    reference: 'Mark 10:45',
    text: 'For even the Son of Man came not to be served but to serve, and to give his life as a ransom for many.',
    theme: 'Humility',
    reflection: 'You\'re not at the door to take. You\'re there to serve. Clean windows are a service. A fair quote is a service. Follow-up is a service.',
  },
  {
    reference: 'Proverbs 22:4',
    text: 'The reward of humility and fear of the Lord is riches and honor and life.',
    theme: 'Humility',
    reflection: 'Riches and honor don\'t come from arrogance at the door. They come from humility — genuine care, honest pricing, teachable spirit.',
  },
  {
    reference: 'Matthew 23:12',
    text: 'Whoever exalts himself will be humbled, and whoever humbles himself will be exalted.',
    theme: 'Humility',
    reflection: 'Don\'t oversell. Don\'t exaggerate. Be honest about what you offer. Humility at the door builds trust that lasts.',
  },
  {
    reference: '1 Peter 5:5',
    text: 'Clothe yourselves, all of you, with humility toward one another, for "God opposes the proud but gives grace to the humble."',
    theme: 'Humility',
    reflection: 'Grace at the door. Grace with the difficult customer. Grace after the third "no." Humility unlocks grace you can\'t access any other way.',
  },
  {
    reference: 'Micah 6:8',
    text: 'He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?',
    theme: 'Humility',
    reflection: 'Justice: fair pricing. Kindness: genuine care. Humility: knowing the results aren\'t all yours. Three requirements. Simple.',
  },
  {
    reference: 'Proverbs 11:2',
    text: 'When pride comes, then comes disgrace, but with the humble is wisdom.',
    theme: 'Humility',
    reflection: 'The day you think you\'ve mastered door knocking is the day it humbles you. Stay humble. Wisdom lives there.',
  },
  {
    reference: 'Matthew 20:26',
    text: 'Whoever would be great among you must be your servant.',
    theme: 'Humility',
    reflection: 'Greatness in this business looks like service — showing up on time, doing quality work, answering the phone. Servant first, CEO second.',
  },
  {
    reference: 'Luke 14:11',
    text: 'For everyone who exalts himself will be humbled, and he who humbles himself will be exalted.',
    theme: 'Humility',
    reflection: 'The salesman who listens is exalted by the customer. The one who only talks is shown the door. Humble yourself at every porch.',
  },
  {
    reference: 'Galatians 5:13',
    text: 'For you were called to freedom, brothers. Only do not use your freedom as an opportunity for the flesh, but through love serve one another.',
    theme: 'Humility',
    reflection: 'You have the freedom of entrepreneurship. Don\'t waste it on ego. Use it to serve customers better than any corporate crew could.',
  },
  {
    reference: 'James 4:10',
    text: 'Humble yourselves before the Lord, and he will exalt you.',
    theme: 'Humility',
    reflection: 'Before the Lord — not before the customer, not before the competition. Humble yourself in the car before the first knock. He handles the rest.',
  },
  {
    reference: 'Proverbs 15:33',
    text: 'The fear of the Lord is instruction in wisdom, and humility comes before honor.',
    theme: 'Humility',
    reflection: 'Honor — the 5-star reviews, the referrals, the reputation — comes after the humility. Not before. Serve humbly first.',
  },
  {
    reference: 'Romans 12:3',
    text: 'For by the grace given to me I say to everyone among you not to think of himself more highly than he ought to think.',
    theme: 'Humility',
    reflection: 'Had a great week? Praise God. Don\'t let it inflate your head. Next week\'s doors don\'t know about last week\'s wins.',
  },
  {
    reference: 'Matthew 7:12',
    text: 'So whatever you wish that others would do to you, do also to them.',
    theme: 'Humility',
    reflection: 'How would you want someone to knock your door? With respect, honesty, and no pressure? Do exactly that.',
  },
  {
    reference: 'John 13:14',
    text: 'If I then, your Lord and Teacher, have washed your feet, you also ought to wash one another\'s feet.',
    theme: 'Humility',
    reflection: 'If the King of Kings washes feet, you can clean windows with zero ego. There\'s no task beneath the one who serves.',
  },
  {
    reference: 'Ephesians 4:2',
    text: 'With all humility and gentleness, with patience, bearing with one another in love.',
    theme: 'Humility',
    reflection: 'The indecisive customer. The homeowner who wastes your time. Bear with them in love. Patience at the door compounds into loyalty.',
  },
  {
    reference: 'Philippians 2:4',
    text: 'Let each of you look not only to his own interests, but also to the interests of others.',
    theme: 'Humility',
    reflection: 'At the door, look at it from their side. What do they need? What are they worried about? Their interest first. Yours follows.',
  },
  {
    reference: 'Proverbs 27:2',
    text: 'Let another praise you, and not your own mouth; a stranger, and not your own lips.',
    theme: 'Humility',
    reflection: 'Don\'t pitch yourself. Let your reviews, your work, and your reputation do the talking. The best salesmen don\'t brag — they demonstrate.',
  },
  {
    reference: '1 Corinthians 9:19',
    text: 'For though I am free from all, I have made myself a servant to all, that I might win more of them.',
    theme: 'Humility',
    reflection: 'Paul became a servant to win people. You become a servant at the door to win customers. Same principle, different century.',
  },
  {
    reference: 'Matthew 5:5',
    text: 'Blessed are the meek, for they shall inherit the earth.',
    theme: 'Humility',
    reflection: 'Meek doesn\'t mean weak. It means strength under control. The ability to stay calm after a rude homeowner — that\'s meekness. And it inherits.',
  },

  // ═══════════════════════════════════════════════════════════
  // FAITH & TRUST (341–365)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Hebrews 11:1',
    text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.',
    theme: 'Faith',
    reflection: 'You knock a door hoping someone answers. You follow up trusting they\'ll call back. The whole business runs on conviction in things not yet visible.',
  },
  {
    reference: 'Matthew 17:20',
    text: 'For truly, I say to you, if you have faith like a grain of mustard seed, you will say to this mountain, "Move from here to there," and it will move.',
    theme: 'Faith',
    reflection: 'A grain of faith. Not a mountain of it. Just enough to knock one more door when everything says stop. That tiny seed moves everything.',
  },
  {
    reference: 'Mark 11:24',
    text: 'Therefore I tell you, whatever you ask in prayer, believe that you have received it, and it will be yours.',
    theme: 'Faith',
    reflection: 'Pray for the deal. Then walk to the door believing it\'s already handled. That\'s not delusion — that\'s faith in action.',
  },
  {
    reference: 'Romans 10:17',
    text: 'So faith comes from hearing, and hearing through the word of Christ.',
    theme: 'Faith',
    reflection: 'Feed your faith before you feed your pipeline. The Word in the morning builds the confidence you carry to the door.',
  },
  {
    reference: 'Hebrews 11:6',
    text: 'And without faith it is impossible to please him, for whoever would draw near to God must believe that he exists and that he rewards those who seek him.',
    theme: 'Faith',
    reflection: 'He rewards seekers. Seek Him first, then seek the next customer. The reward structure is built into the universe.',
  },
  {
    reference: 'Matthew 21:22',
    text: 'And whatever you ask in prayer, you will receive, if you have faith.',
    theme: 'Faith',
    reflection: 'Pray specifically. Not "bless my day" but "open the right doors, give me the right words, lead me to the right streets." Then believe.',
  },
  {
    reference: 'Psalm 62:8',
    text: 'Trust in him at all times, O people; pour out your heart before him; God is a refuge for us.',
    theme: 'Faith',
    reflection: 'At all times — not just when the pipeline is full. Trust Him when it\'s empty too. Pour out the frustration. He can handle it.',
  },
  {
    reference: 'Proverbs 3:26',
    text: 'For the Lord will be your confidence and will keep your foot from being caught.',
    theme: 'Faith',
    reflection: 'Confidence at the door doesn\'t come from memorizing a script. It comes from knowing who backs you up.',
  },
  {
    reference: 'Psalm 9:10',
    text: 'And those who know your name put their trust in you, for you, O Lord, have not forsaken those who seek you.',
    theme: 'Faith',
    reflection: 'Not forsaken. Not once. Not on the worst day. Not after 50 rejections. He has never abandoned someone who seeks Him.',
  },
  {
    reference: 'Isaiah 26:3',
    text: 'You keep him in perfect peace whose mind is stayed on you, because he trusts in you.',
    theme: 'Faith',
    reflection: 'Perfect peace while door knocking — is that even possible? Keep your mind stayed on Him between doors. The peace is real.',
  },
  {
    reference: 'Psalm 37:3',
    text: 'Trust in the Lord, and do good; dwell in the land and befriend faithfulness.',
    theme: 'Faith',
    reflection: 'Trust, then do. Dwell in your territory — don\'t hop around chasing greener grass. Befriend faithfulness. It\'s a relationship, not a technique.',
  },
  {
    reference: 'Matthew 14:29',
    text: 'He said, "Come." So Peter got out of the boat and walked on the water and came to Jesus.',
    theme: 'Faith',
    reflection: 'Peter stepped out of the boat onto nothing solid. You step out of the car into an unknown neighborhood. Same kind of faith. Walk.',
  },
  {
    reference: 'Psalm 56:4',
    text: 'In God, whose word I praise, in God I trust; I shall not be afraid. What can flesh do to me?',
    theme: 'Faith',
    reflection: 'What can a closed door do to you? What can a "no" do? What can a bad day do? Nothing that changes who you are.',
  },
  {
    reference: 'Psalm 20:7',
    text: 'Some trust in chariots and some in horses, but we trust in the name of the Lord our God.',
    theme: 'Faith',
    reflection: 'Some trust in fancy trucks and branded uniforms. Those help. But your real edge is the name you trust in before you even pull up.',
  },
  {
    reference: 'Psalm 91:2',
    text: 'I will say to the Lord, "My refuge and my fortress, my God, in whom I trust."',
    theme: 'Faith',
    reflection: 'Say it out loud in the car before the first knock. My refuge. My fortress. My God. Then go.',
  },
  {
    reference: 'Isaiah 12:2',
    text: 'Behold, God is my salvation; I will trust, and will not be afraid; for the Lord God is my strength and my song.',
    theme: 'Faith',
    reflection: 'Strength for the knock. Song for the drive. Trust for the outcome. Three gifts wrapped in one verse.',
  },
  {
    reference: 'Jeremiah 17:7',
    text: 'Blessed is the man who trusts in the Lord, whose trust is the Lord.',
    theme: 'Faith',
    reflection: 'Not just trust in what He gives. Trust in who He is. When the pipeline is dry and the leads are cold — blessed is the one who still trusts.',
  },
  {
    reference: 'Psalm 125:1',
    text: 'Those who trust in the Lord are like Mount Zion, which cannot be moved, but abides forever.',
    theme: 'Faith',
    reflection: 'Unmovable. Not swayed by one bad week. Not shaken by one angry homeowner. Rooted like a mountain that doesn\'t budge.',
  },
  {
    reference: 'Proverbs 30:5',
    text: 'Every word of God proves true; he is a shield to those who take refuge in him.',
    theme: 'Faith',
    reflection: 'Every word. Every promise. Proven true — not in theory, but in the life of every worker who has ever trusted Him through uncertainty.',
  },
  {
    reference: 'Psalm 46:5',
    text: 'God is in the midst of her; she shall not be moved; God will help her when morning dawns.',
    theme: 'Faith',
    reflection: 'When morning dawns. That\'s when the help arrives — right when you need it, right when the day begins. He\'s in the midst of your work.',
  },
  {
    reference: '2 Corinthians 5:7',
    text: 'For we walk by faith, not by sight.',
    theme: 'Faith',
    reflection: 'You can\'t see behind the next door. You don\'t know if this neighborhood will convert. You walk by faith. That\'s the only way this works.',
  },
  {
    reference: 'Romans 15:13',
    text: 'May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope.',
    theme: 'Faith',
    reflection: 'Joy, peace, and hope — all from believing. Carry that cocktail to every door today. It\'s contagious, and homeowners can feel it.',
  },
  {
    reference: 'Psalm 33:4',
    text: 'For the word of the Lord is upright, and all his work is done in faithfulness.',
    theme: 'Faith',
    reflection: 'All His work is faithful. If He placed this calling on your life, He\'s faithful to sustain it. Trust the process. Trust the provider.',
  },
  {
    reference: 'Psalm 40:4',
    text: 'Blessed is the man who makes the Lord his trust.',
    theme: 'Faith',
    reflection: 'The last verse for tonight. The first truth for tomorrow. Make Him your trust — not the pipeline, not the CRM, not the closing ratio. Him. Then go knock.',
  },
  {
    reference: 'Psalm 34:8',
    text: 'Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him!',
    theme: 'Faith',
    reflection: 'Taste and see. Not just hear about it. Experience His goodness in the field — in the unexpected close, the perfect timing, the door that shouldn\'t have opened but did.',
  },

  // ═══════════════════════════════════════════════════════════
  // PATIENCE & TIMING (252–280)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Ecclesiastes 3:1',
    text: 'For everything there is a season, and a time for every matter under heaven.',
    theme: 'Patience',
    reflection: 'A time to knock and a time to follow up. A time to push and a time to step back. Read the season you\'re in.',
  },
  {
    reference: 'Psalm 27:14',
    text: 'Wait for the Lord; be strong, and let your heart take courage; wait for the Lord!',
    theme: 'Patience',
    reflection: 'The deal that\'s taking forever to close? Wait with strength, not anxiety. Courage isn\'t rushing — it\'s trusting the timing.',
  },
  {
    reference: 'Isaiah 55:10-11',
    text: 'For as the rain and the snow come down from heaven and do not return there but water the earth, so shall my word be that goes out from my mouth; it shall not return to me empty.',
    theme: 'Patience',
    reflection: 'Your words at the door are seeds. They don\'t return empty. Even the "no" conversations planted something. Be patient for the harvest.',
  },
  {
    reference: 'Psalm 130:5',
    text: 'I wait for the Lord, my soul waits, and in his word I hope.',
    theme: 'Patience',
    reflection: 'Waiting between follow-ups. Waiting for the callback. Waiting for the season to pick up. Wait with hope, not dread.',
  },
  {
    reference: 'Romans 8:25',
    text: 'But if we hope for what we do not see, we wait for it with patience.',
    theme: 'Patience',
    reflection: 'You can\'t see next month\'s revenue yet. You can\'t see which door becomes the deal. Hope and patience — that\'s how you wait.',
  },
  {
    reference: 'James 5:7',
    text: 'Be patient, therefore, brothers, until the coming of the Lord. See how the farmer waits for the precious fruit of the earth, being patient about it.',
    theme: 'Patience',
    reflection: 'The farmer plants and waits. He doesn\'t dig up the seed to check. Knock, follow up, then let it grow. Stop digging.',
  },
  {
    reference: 'Hebrews 6:15',
    text: 'And thus Abraham, having patiently waited, obtained the promise.',
    theme: 'Patience',
    reflection: 'Abraham waited decades for the promise. Your timeline is shorter. But the principle is the same: patient waiting precedes obtaining.',
  },
  {
    reference: 'Psalm 37:9',
    text: 'For the evildoers shall be cut off, but those who wait for the Lord shall inherit the land.',
    theme: 'Patience',
    reflection: 'Inherit the territory. Not grab it, not force it — inherit it. That comes to those who wait and work faithfully.',
  },
  {
    reference: 'Ecclesiastes 7:8',
    text: 'Better is the end of a thing than its beginning, and the patient in spirit is better than the proud in spirit.',
    theme: 'Patience',
    reflection: 'The end of the follow-up cycle is better than the beginning. Patient spirit over proud spirit — at every door.',
  },
  {
    reference: 'Isaiah 49:23',
    text: 'Those who wait for me shall not be put to shame.',
    theme: 'Patience',
    reflection: 'Waiting feels like losing. It\'s not. Those who wait on His timing are never shamed. The breakthrough comes.',
  },
  {
    reference: 'Psalm 62:5',
    text: 'For God alone, O my soul, wait in silence; for my hope is from him.',
    theme: 'Patience',
    reflection: 'Between doors, silence. Between neighborhoods, stillness. Let the hope reset. It comes from Him, not from the last interaction.',
  },
  {
    reference: 'Colossians 1:11',
    text: 'Being strengthened with all power, according to his glorious might, for all endurance and patience with joy.',
    theme: 'Patience',
    reflection: 'Patience with JOY — not gritting your teeth, but genuinely enjoying the process. Joy in the wait changes everything.',
  },
  {
    reference: 'Proverbs 25:15',
    text: 'With patience a ruler may be persuaded, and a soft tongue will break a bone.',
    theme: 'Patience',
    reflection: 'Patience persuades. The homeowner who said "not today" three times? Patient, gentle persistence breaks through what force can\'t.',
  },
  {
    reference: 'Luke 8:15',
    text: 'As for that in the good soil, they are those who, hearing the word, hold it fast in an honest and good heart, and bear fruit with patience.',
    theme: 'Patience',
    reflection: 'Bear fruit with patience. Not instantly. Not overnight. With patience. The good-soil customer takes time to close. Hold fast.',
  },
  {
    reference: 'Psalm 40:1-2',
    text: 'I waited patiently for the Lord; he inclined to me and heard my cry. He drew me up from the pit.',
    theme: 'Patience',
    reflection: 'He hears the cry of the patient waiter. Even in the pit of a terrible week, patient waiting draws you out.',
  },
  {
    reference: '2 Peter 3:9',
    text: 'The Lord is not slow to fulfill his promise as some count slowness, but is patient toward you.',
    theme: 'Patience',
    reflection: 'He\'s patient with you on your worst days. Extend that same patience to the homeowner who can\'t decide.',
  },

  // ═══════════════════════════════════════════════════════════
  // INTEGRITY & CHARACTER (281–310)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Proverbs 10:9',
    text: 'Whoever walks in integrity walks securely, but he who makes his ways crooked will be found out.',
    theme: 'Integrity',
    reflection: 'Honest quotes. Real timelines. No hidden fees. Integrity means you sleep well and your reputation precedes you at every door.',
  },
  {
    reference: 'Proverbs 11:3',
    text: 'The integrity of the upright guides them, but the crookedness of the treacherous destroys them.',
    theme: 'Integrity',
    reflection: 'Let integrity guide your pricing, your promises, and your follow-through. It\'s a compass that never misleads.',
  },
  {
    reference: 'Psalm 15:1-2',
    text: 'O Lord, who shall sojourn in your tent? He who walks blamelessly and does what is right and speaks truth in his heart.',
    theme: 'Integrity',
    reflection: 'Speak truth at the door. Not exaggerated claims. Not manipulative urgency. Truth — and let it sell itself.',
  },
  {
    reference: 'Proverbs 12:22',
    text: 'Lying lips are an abomination to the Lord, but those who act faithfully are his delight.',
    theme: 'Integrity',
    reflection: 'Never oversell. Never fabricate urgency. Never lie about availability. Faithful action at the door delights God.',
  },
  {
    reference: 'Proverbs 20:7',
    text: 'The righteous who walks in his integrity — blessed are his children after him!',
    theme: 'Integrity',
    reflection: 'Your integrity today builds a reputation your future business inherits. Walk right now so tomorrow\'s doors open easier.',
  },
  {
    reference: 'Luke 16:10',
    text: 'One who is faithful in a very little is also faithful in much.',
    theme: 'Integrity',
    reflection: 'Faithful with the $150 window job. Faithful with showing up on time. Faithful with the follow-up text. That\'s how you earn the $5,000 contracts.',
  },
  {
    reference: 'Proverbs 22:1',
    text: 'A good name is to be chosen rather than great riches, and favor rather than silver or gold.',
    theme: 'Integrity',
    reflection: 'Your name in the neighborhood matters more than one big deal. A good name brings referrals for years. Protect it.',
  },
  {
    reference: 'Matthew 5:37',
    text: 'Let what you say be simply "Yes" or "No"; anything more than this comes from evil.',
    theme: 'Integrity',
    reflection: 'Say what you mean at the door. If you can do it Tuesday, say Tuesday. If you can\'t, say so. Simple honesty closes more than clever talk.',
  },
  {
    reference: 'Proverbs 19:1',
    text: 'Better is a poor person who walks in his integrity than one who is crooked in speech and is a fool.',
    theme: 'Integrity',
    reflection: 'A slow week with clean deals is better than a big week built on overpromising. Integrity over income.',
  },
  {
    reference: 'Colossians 3:9',
    text: 'Do not lie to one another, seeing that you have put off the old self with its practices.',
    theme: 'Integrity',
    reflection: 'No lies at the door. Not about your availability, not about your pricing, not about what the service includes. The old self lied. You don\'t.',
  },
  {
    reference: 'Proverbs 28:6',
    text: 'Better is a poor man who walks in his integrity than a rich man who is crooked in his ways.',
    theme: 'Integrity',
    reflection: 'You don\'t need crooked shortcuts. Build it right. Walk straight. The money follows the character.',
  },
  {
    reference: '1 Peter 2:12',
    text: 'Keep your conduct among the Gentiles honorable, so that when they speak against you as evildoers, they may see your good deeds and glorify God.',
    theme: 'Integrity',
    reflection: 'Some people distrust door-to-door salesmen on sight. Your honorable conduct — showing up, delivering, being real — changes that narrative.',
  },
  {
    reference: 'Titus 2:7',
    text: 'Show yourself in all respects to be a model of good works, and in your teaching show integrity.',
    theme: 'Integrity',
    reflection: 'Be the model of what this business can be. Show the homeowner that not all door knockers are the same.',
  },
  {
    reference: 'Proverbs 16:11',
    text: 'A just balance and scales are the Lord\'s; all the weights in the bag are his work.',
    theme: 'Integrity',
    reflection: 'Fair pricing is His work. Just scales at the door — charging honestly for honest work. That balance is sacred.',
  },
  {
    reference: '2 Corinthians 8:21',
    text: 'For we aim at what is honorable not only in the Lord\'s sight but also in the sight of man.',
    theme: 'Integrity',
    reflection: 'Honorable in both directions — before God and before the customer. Your work should hold up to scrutiny from both.',
  },

  // ═══════════════════════════════════════════════════════════
  // JOY & GRATITUDE (311–340)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Philippians 4:4',
    text: 'Rejoice in the Lord always; again I will say, rejoice.',
    theme: 'Joy',
    reflection: 'Always. Not just on closing days. Not just when the weather is nice. On the hard days too. Rejoice is a choice, not a reaction.',
  },
  {
    reference: '1 Thessalonians 5:16-18',
    text: 'Rejoice always, pray without ceasing, give thanks in all circumstances.',
    theme: 'Joy',
    reflection: 'Three instructions that change how you knock: joy at every door, prayer between every house, gratitude after every interaction — even the bad ones.',
  },
  {
    reference: 'Psalm 100:2',
    text: 'Serve the Lord with gladness! Come into his presence with singing!',
    theme: 'Joy',
    reflection: 'Sing in the car between houses. Seriously. Gladness changes your energy. The next homeowner can feel it before you even speak.',
  },
  {
    reference: 'Psalm 118:24',
    text: 'This is the day that the Lord has made; let us rejoice and be glad in it.',
    theme: 'Joy',
    reflection: 'Before the first knock — choose gladness. This specific day was made for you. Rejoice in it whether it produces one deal or ten.',
  },
  {
    reference: 'James 1:2',
    text: 'Count it all joy, my brothers, when you meet trials of various kinds.',
    theme: 'Joy',
    reflection: 'The trial of a dead neighborhood? Joy. The trial of an angry homeowner? Joy. Counting it joy doesn\'t mean it\'s fun — it means you see the growth.',
  },
  {
    reference: 'Psalm 16:9',
    text: 'Therefore my heart is glad, and my whole being rejoices; my flesh also dwells secure.',
    theme: 'Joy',
    reflection: 'Heart glad. Being rejoicing. Body secure. That\'s the posture of someone who trusts God with their door count.',
  },
  {
    reference: 'Proverbs 17:22',
    text: 'A joyful heart is good medicine, but a crushed spirit dries up the bones.',
    theme: 'Joy',
    reflection: 'Your energy at the door is medicine or poison. A joyful heart is contagious. A crushed spirit repels. Choose the medicine.',
  },
  {
    reference: 'Romans 12:15',
    text: 'Rejoice with those who rejoice, weep with those who weep.',
    theme: 'Joy',
    reflection: 'When a homeowner shares good news, celebrate with them. When they share struggles, listen. Genuine empathy builds trust faster than any pitch.',
  },
  {
    reference: 'Isaiah 55:12',
    text: 'For you shall go out in joy and be led forth in peace; the mountains and the hills before you shall break forth into singing.',
    theme: 'Joy',
    reflection: 'Go OUT in joy — not hoping to find it at the door, but carrying it from the car to the porch. Joy goes with you.',
  },
  {
    reference: 'Psalm 30:5',
    text: 'His anger is but for a moment, and his favor is for a lifetime. Weeping may tarry for the night, but joy comes with the morning.',
    theme: 'Joy',
    reflection: 'Morning joy. Every new day resets the emotional counter. Whatever happened yesterday, joy is available right now.',
  },
  {
    reference: 'Colossians 3:15',
    text: 'And let the peace of Christ rule in your hearts, to which indeed you were called in one body. And be thankful.',
    theme: 'Joy',
    reflection: 'Let peace rule — not anxiety about the numbers, not pressure about the quota. Peace rules. Thankfulness follows. Doors open to that energy.',
  },
  {
    reference: 'Psalm 107:1',
    text: 'Oh give thanks to the Lord, for he is good, for his steadfast love endures forever!',
    theme: 'Joy',
    reflection: 'Start the day with thanks. Thank Him for the ability to work, the territory to knock, the freedom to build. Gratitude is the foundation.',
  },
  {
    reference: 'Habakkuk 3:17-18',
    text: 'Though the fig tree should not blossom, nor fruit be on the vines, yet I will rejoice in the Lord; I will take joy in the God of my salvation.',
    theme: 'Joy',
    reflection: 'No leads today? No fruit on the vine? Rejoice anyway. Joy that depends on results is fragile. Joy rooted in God is unshakeable.',
  },
  {
    reference: 'Psalm 92:1-2',
    text: 'It is good to give thanks to the Lord, to sing praises to your name, O Most High; to declare your steadfast love in the morning.',
    theme: 'Joy',
    reflection: 'Declare His love in the morning — before results come in. That declaration sets the tone for everything that follows.',
  },
  {
    reference: 'Nehemiah 8:10',
    text: 'Do not be grieved, for the joy of the Lord is your strength.',
    theme: 'Joy',
    reflection: 'Grieving a lost deal? Let His joy be your strength instead. Grief weakens. Joy fuels. Choose the fuel source.',
  },

  // ═══════════════════════════════════════════════════════════
  // WORDS & SPEECH (341–365)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Proverbs 18:21',
    text: 'Death and life are in the power of the tongue, and those who love it will eat its fruits.',
    theme: 'Words',
    reflection: 'Your words at the door carry life or death for the deal. Speak life — into the homeowner, into the interaction, into your own confidence.',
  },
  {
    reference: 'Proverbs 15:1',
    text: 'A soft answer turns away wrath, but a harsh word stirs up anger.',
    theme: 'Words',
    reflection: 'Hostile homeowner? Soft answer. Angry response? Stay calm. A gentle response disarms people faster than matching their energy.',
  },
  {
    reference: 'Proverbs 16:24',
    text: 'Gracious words are like a honeycomb, sweetness to the soul and health to the body.',
    theme: 'Words',
    reflection: 'Your pitch should be honeycomb — sweet, genuine, good for the listener. Not slimy. Not pushy. Gracious.',
  },
  {
    reference: 'Ephesians 4:29',
    text: 'Let no corrupting talk come out of your mouths, but only such as is good for building up, as fits the occasion.',
    theme: 'Words',
    reflection: 'Build people up at the door. Compliment their home. Acknowledge their time. Words that build create openings that tricks never do.',
  },
  {
    reference: 'Proverbs 12:18',
    text: 'There is one whose rash words are like sword thrusts, but the tongue of the wise brings healing.',
    theme: 'Words',
    reflection: 'Rushing your pitch stabs the moment. Slow down. Let wise, measured words bring healing — and trust.',
  },
  {
    reference: 'Proverbs 25:11',
    text: 'A word fitly spoken is like apples of gold in a setting of silver.',
    theme: 'Words',
    reflection: 'The right word at the right moment — that\'s what closes deals. Not volume. Not pressure. Timing and fit.',
  },
  {
    reference: 'Colossians 4:6',
    text: 'Let your speech always be gracious, seasoned with salt, so that you may know how you ought to answer each person.',
    theme: 'Words',
    reflection: 'Seasoned with salt — memorable, genuine, a little bold. Not bland. Not aggressive. Gracious AND flavorful.',
  },
  {
    reference: 'Proverbs 10:19',
    text: 'When words are many, transgression is not lacking, but whoever restrains his lips is prudent.',
    theme: 'Words',
    reflection: 'Talk less at the door. Listen more. The salesman who restrains his lips and asks questions always outperforms the one who monologues.',
  },
  {
    reference: 'Proverbs 15:23',
    text: 'A man has joy in an apt answer, and a word in season, how good it is!',
    theme: 'Words',
    reflection: 'The apt answer to the objection. The word in season when they hesitate. That moment of clarity — that\'s a gift. Ask for it.',
  },
  {
    reference: 'Proverbs 21:23',
    text: 'Whoever keeps his mouth and his tongue keeps himself out of trouble.',
    theme: 'Words',
    reflection: 'Don\'t overpromise at the door. Don\'t trash the competition. Keep your tongue disciplined and you keep your reputation clean.',
  },
  {
    reference: 'Matthew 12:36',
    text: 'I tell you, on the day of judgment people will give account for every careless word they speak.',
    theme: 'Words',
    reflection: 'Every careless word at the door — the half-truth, the exaggeration, the promise you can\'t keep. Words have weight. Speak carefully.',
  },
  {
    reference: 'Proverbs 13:3',
    text: 'Whoever guards his mouth preserves his life, but he who opens wide his lips comes to ruin.',
    theme: 'Words',
    reflection: 'Guard the pitch. Don\'t ramble. Don\'t over-explain. Say what matters, ask for the close, and let silence do the work.',
  },
  {
    reference: 'Psalm 141:3',
    text: 'Set a guard, O Lord, over my mouth; keep watch over the door of my lips!',
    theme: 'Words',
    reflection: 'Pray this before the first knock. A guarded mouth doesn\'t say things you\'ll regret after leaving the porch.',
  },
  {
    reference: 'Proverbs 17:27',
    text: 'Whoever restrains his words has knowledge, and he who has a cool spirit is a man of understanding.',
    theme: 'Words',
    reflection: 'Cool spirit at a hot door. Restrained words when you want to argue. That\'s understanding — and it wins respect.',
  },
  {
    reference: 'Isaiah 50:4',
    text: 'The Lord God has given me the tongue of those who are taught, that I may know how to sustain with a word him who is weary.',
    theme: 'Words',
    reflection: 'Some homeowners are weary — of solicitors, of life, of decisions. Your words can sustain them instead of drain them. Be that person at the door.',
  },
  {
    reference: 'Proverbs 15:4',
    text: 'A gentle tongue is a tree of life, but perverseness in it breaks the spirit.',
    theme: 'Words',
    reflection: 'A gentle tongue — not weak, not passive, but gentle. Life-giving. The homeowner remembers how you made them feel long after they forget what you said.',
  },
  {
    reference: 'Ecclesiastes 10:12',
    text: 'The words of a wise man\'s mouth win him favor, but the lips of a fool consume him.',
    theme: 'Words',
    reflection: 'Favor at the door is won by wise words. Not the most words. Not the cleverest words. Wise ones. Speak to serve, not to impress.',
  },
  {
    reference: '1 Peter 3:10',
    text: 'Whoever desires to love life and see good days, let him keep his tongue from evil and his lips from speaking deceit.',
    theme: 'Words',
    reflection: 'Good days start with honest lips. No deceit at the door — no fake urgency, no false scarcity, no misleading promises. Truth builds good days.',
  },
  {
    reference: 'Proverbs 12:25',
    text: 'Anxiety in a man\'s heart weighs him down, but a good word makes him glad.',
    theme: 'Words',
    reflection: 'You might be the good word in someone\'s anxious day. A genuine compliment, a kind greeting, a real smile — it makes people glad. And glad people buy.',
  },
  {
    reference: 'Psalm 19:14',
    text: 'Let the words of my mouth and the meditation of my heart be acceptable in your sight, O Lord, my rock and my redeemer.',
    theme: 'Words',
    reflection: 'The final verse. The prayer that covers every word you\'ll speak today — at the door, on the phone, in the follow-up text. Let it all be acceptable. Then go build.',
  },

  // ═══════════════════════════════════════════════════════════
  // BOLDNESS & ACTION (318–333)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'Acts 4:31',
    text: 'And when they had prayed, the place in which they were gathered together was shaken, and they were all filled with the Holy Spirit and continued to speak the word of God with boldness.',
    theme: 'Boldness',
    reflection: 'They prayed, then they spoke with boldness. Prayer first, boldness second. That\'s the order. Pray in the car, then knock with authority.',
  },
  {
    reference: 'Proverbs 28:1',
    text: 'The wicked flee when no one pursues, but the righteous are bold as a lion.',
    theme: 'Boldness',
    reflection: 'Don\'t flee from the big house. Don\'t shrink from the wealthy neighborhood. You\'re righteous. Walk bold.',
  },
  {
    reference: 'Ephesians 3:12',
    text: 'In whom we have boldness and access with confidence through our faith in him.',
    theme: 'Boldness',
    reflection: 'Boldness AND confidence — not cockiness, but the settled assurance that you have a right to be at that door with something valuable to offer.',
  },
  {
    reference: 'Acts 14:3',
    text: 'So they remained for a long time, speaking boldly for the Lord.',
    theme: 'Boldness',
    reflection: 'They stayed a long time in hostile territory. You stay in a tough neighborhood. Bold speech. Long persistence. That\'s the combo.',
  },
  {
    reference: 'Hebrews 4:16',
    text: 'Let us then with confidence draw near to the throne of grace, that we may receive mercy and help in time of need.',
    theme: 'Boldness',
    reflection: 'If you can approach the throne of God with confidence, you can approach any doorstep. Draw near boldly.',
  },
  {
    reference: 'Acts 9:29',
    text: 'He spoke and disputed boldly in the name of the Lord Jesus.',
    theme: 'Boldness',
    reflection: 'Paul disputed boldly — not rudely, but without backing down. When a homeowner challenges your price, stand firm. Bold doesn\'t mean aggressive.',
  },
  {
    reference: 'Deuteronomy 1:21',
    text: 'See, the Lord your God has set the land before you. Go up, take possession, as the Lord has told you. Do not fear or be dismayed.',
    theme: 'Boldness',
    reflection: 'The territory is set before you. Go up. Take possession. That neighborhood isn\'t going to knock itself. Move.',
  },
  {
    reference: 'Joshua 1:6',
    text: 'Be strong and courageous, for you shall cause this people to inherit the land that I swore to their fathers to give them.',
    theme: 'Boldness',
    reflection: 'You\'re causing your family to inherit something. Every bold knock builds the future you\'re fighting for.',
  },
  {
    reference: 'Isaiah 50:7',
    text: 'But the Lord God helps me; therefore I have not been disgraced; therefore I have set my face like a flint.',
    theme: 'Boldness',
    reflection: 'Face like flint — determined, unshakeable, pointed in one direction. Set your face toward the next street and don\'t flinch.',
  },
  {
    reference: 'Ezekiel 3:8-9',
    text: 'Behold, I have made your face as hard as their faces, and your forehead as hard as their foreheads. Like emery harder than flint have I made your forehead.',
    theme: 'Boldness',
    reflection: 'Hardened for the task. Not cold — prepared. Your resolve is built to withstand whatever comes from behind that door.',
  },
  {
    reference: '2 Corinthians 3:12',
    text: 'Since we have such a hope, we are very bold.',
    theme: 'Boldness',
    reflection: 'Hope fuels boldness. When you know the harvest is coming, you knock without hesitation.',
  },
  {
    reference: 'Philippians 1:20',
    text: 'It is my eager expectation and hope that I will not be at all ashamed, but that with full courage Christ will be honored.',
    theme: 'Boldness',
    reflection: 'Full courage. Not half. Not tentative. Full. That\'s how you approach the door — unashamed of your work and who you represent.',
  },
  {
    reference: '1 Thessalonians 2:2',
    text: 'But though we had already suffered and been shamefully treated, we had boldness in our God to declare the gospel to you.',
    theme: 'Boldness',
    reflection: 'Paul got beaten and still knocked the next city. You got rejected and you\'re still out here. That\'s boldness that can\'t be taught.',
  },
  {
    reference: 'Judges 6:14',
    text: 'And the Lord turned to him and said, "Go in this might of yours and save Israel from the hand of Midian; do not I send you?"',
    theme: 'Boldness',
    reflection: 'Go in this might of YOURS. Whatever you\'ve got — your personality, your hustle, your story — He says it\'s enough. Go.',
  },
  {
    reference: 'Numbers 13:30',
    text: 'But Caleb quieted the people and said, "Let us go up at once and occupy it, for we are well able to overcome it."',
    theme: 'Boldness',
    reflection: 'Everyone else said the territory was too hard. Caleb said go now. Be a Caleb — don\'t let fear of the territory stop you from taking it.',
  },
  {
    reference: 'Psalm 138:3',
    text: 'On the day I called, you answered me; my strength of soul you increased.',
    theme: 'Boldness',
    reflection: 'Soul strength — the inner steel that keeps you knocking when everything external says stop. Call on Him and feel it increase.',
  },

  // ═══════════════════════════════════════════════════════════
  // DISCIPLINE & CONSISTENCY (334–349)
  // ═══════════════════════════════════════════════════════════
  {
    reference: '1 Corinthians 9:27',
    text: 'But I discipline my body and keep it under control, lest after preaching to others I myself should be disqualified.',
    theme: 'Discipline',
    reflection: 'Discipline your routine. Wake up time, knock start time, door count — keep it under control. Undisciplined days produce undisciplined results.',
  },
  {
    reference: 'Proverbs 12:1',
    text: 'Whoever loves discipline loves knowledge, but he who hates reproof is stupid.',
    theme: 'Discipline',
    reflection: 'Love the discipline of daily knocking. Love the reproof of bad days that teach you. Hate reproof, stay stuck.',
  },
  {
    reference: 'Hebrews 12:11',
    text: 'For the moment all discipline seems painful rather than pleasant, but later it yields the peaceful fruit of righteousness.',
    theme: 'Discipline',
    reflection: 'The alarm at 7am is painful. The first five doors are painful. But later — the pipeline, the revenue, the freedom — that\'s the fruit.',
  },
  {
    reference: 'Proverbs 6:6-8',
    text: 'Go to the ant, O sluggard; consider her ways, and be wise. Without having any chief or officer or ruler, she prepares her bread in summer.',
    theme: 'Discipline',
    reflection: 'No boss. No manager. No one telling you to knock. The ant works without supervision. Be the ant.',
  },
  {
    reference: '1 Timothy 4:7',
    text: 'Train yourself for godliness.',
    theme: 'Discipline',
    reflection: 'Training isn\'t a one-time thing. It\'s daily. Train your pitch, train your body, train your discipline. Reps make the master.',
  },
  {
    reference: 'Proverbs 13:18',
    text: 'Poverty and disgrace come to him who ignores instruction, but whoever heeds reproof is honored.',
    theme: 'Discipline',
    reflection: 'The data tells you what works. The CRM shows your conversion rates. Heed the reproof of your own numbers. Adjust.',
  },
  {
    reference: 'Proverbs 25:28',
    text: 'A man without self-control is like a city broken into and left without walls.',
    theme: 'Discipline',
    reflection: 'Without discipline — no routine, no consistency, no follow-up cadence — your business has no walls. Build the structure.',
  },
  {
    reference: 'Galatians 5:22-23',
    text: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control.',
    theme: 'Discipline',
    reflection: 'Self-control is a fruit of the Spirit, not willpower alone. Ask for it. The discipline to knock 50 doors is Spirit-given.',
  },
  {
    reference: '2 Peter 1:5-6',
    text: 'Make every effort to supplement your faith with virtue, and virtue with knowledge, and knowledge with self-control.',
    theme: 'Discipline',
    reflection: 'Faith → virtue → knowledge → self-control. It\'s a chain. Each one builds on the last. Start with faith, end with discipline.',
  },
  {
    reference: 'Proverbs 10:5',
    text: 'He who gathers in summer is a prudent son, but he who sleeps in harvest is a son who brings shame.',
    theme: 'Discipline',
    reflection: 'Peak season is harvest time. Don\'t sleep through it. The discipline to max out your knocks during peak directly determines your year.',
  },
  {
    reference: 'Proverbs 20:4',
    text: 'The sluggard does not plow in the autumn; he will seek at harvest and have nothing.',
    theme: 'Discipline',
    reflection: 'Slow season is plow season. Use it to knock new territory, build your pipeline, plant seeds. Those who skip the plow starve at harvest.',
  },
  {
    reference: 'Daniel 6:10',
    text: 'He got down on his knees three times a day and prayed and gave thanks before his God, as he had done previously.',
    theme: 'Discipline',
    reflection: 'Daniel had a non-negotiable routine. What\'s yours? Morning prayer, daily knock count, evening review? Consistency wins kingdoms.',
  },
  {
    reference: '1 Corinthians 9:25',
    text: 'Every athlete exercises self-control in all things. They do it to receive a perishable wreath, but we an imperishable.',
    theme: 'Discipline',
    reflection: 'Athletes train daily for a trophy that fades. You train daily for a business that compounds. Your discipline has eternal returns.',
  },
  {
    reference: 'Proverbs 24:30-34',
    text: 'I passed by the field of a sluggard, by the vineyard of a man lacking sense, and behold, it was all overgrown with thorns.',
    theme: 'Discipline',
    reflection: 'Territory left un-knocked grows thorns — competitors move in, leads go cold, relationships die. Tend your field consistently.',
  },
  {
    reference: 'Psalm 1:2',
    text: 'But his delight is in the law of the Lord, and on his law he meditates day and night.',
    theme: 'Discipline',
    reflection: 'Day and night meditation. Not sporadic. Not when convenient. The disciplined mind that meditates on truth performs differently at the door.',
  },
  {
    reference: 'Proverbs 27:23',
    text: 'Know well the condition of your flocks, and give attention to your herds.',
    theme: 'Discipline',
    reflection: 'Know your numbers. Know your pipeline. Know which zones are hot and which are dead. Attention to your business is a discipline.',
  },

  // ═══════════════════════════════════════════════════════════
  // HARVEST & REWARD (350–365)
  // ═══════════════════════════════════════════════════════════
  {
    reference: 'John 4:35',
    text: 'Do you not say, "There are yet four months, then comes the harvest"? Look, I tell you, lift up your eyes, and see that the fields are white for harvest.',
    theme: 'Harvest',
    reflection: 'Stop saying "next month will be better." The fields are ready NOW. Lift your eyes. The harvest is in front of you today.',
  },
  {
    reference: 'Mark 4:20',
    text: 'But those that were sown on the good soil are the ones who hear the word and accept it and bear fruit, thirtyfold and sixtyfold and a hundredfold.',
    theme: 'Harvest',
    reflection: 'Thirtyfold. Sixtyfold. Hundredfold. The return on good-soil neighborhoods is exponential. Find them. Work them. Harvest.',
  },
  {
    reference: 'Psalm 126:5',
    text: 'Those who sow in tears shall reap with shouts of joy!',
    theme: 'Harvest',
    reflection: 'The tears of a hard week produce the shouts of a breakthrough month. The sowing is painful. The reaping is loud.',
  },
  {
    reference: 'Hosea 10:12',
    text: 'Sow for yourselves righteousness; reap steadfast love; break up your fallow ground, for it is the time to seek the Lord.',
    theme: 'Harvest',
    reflection: 'Break up fallow ground — those neighborhoods you haven\'t touched yet. New territory is new harvest waiting to happen.',
  },
  {
    reference: 'Matthew 9:37-38',
    text: 'The harvest is plentiful, but the laborers are few. Therefore pray earnestly to the Lord of the harvest to send out laborers.',
    theme: 'Harvest',
    reflection: 'The harvest is plentiful. There are more dirty windows than you could ever clean. The territory is abundant. You just have to show up.',
  },
  {
    reference: '2 Corinthians 9:6',
    text: 'Whoever sows sparingly will also reap sparingly, and whoever sows bountifully will also reap bountifully.',
    theme: 'Harvest',
    reflection: 'Knock sparingly, reap sparingly. Knock bountifully — 50, 60, 70 doors — reap bountifully. The math is simple and absolute.',
  },
  {
    reference: 'Proverbs 11:18',
    text: 'The wicked earns deceptive wages, but one who sows righteousness gets a sure reward.',
    theme: 'Harvest',
    reflection: 'A sure reward. Not maybe. Not hopefully. Sure. Righteous sowing — honest knocking, fair quoting, faithful follow-up — guarantees the harvest.',
  },
  {
    reference: 'Genesis 8:22',
    text: 'While the earth remains, seedtime and harvest, cold and heat, summer and winter, day and night, shall not cease.',
    theme: 'Harvest',
    reflection: 'Seedtime and harvest will never cease. As long as you keep sowing, the harvest keeps coming. It\'s a law older than business itself.',
  },
  {
    reference: 'Isaiah 9:3',
    text: 'You have multiplied the nation; you have increased its joy; they rejoice before you as with joy at the harvest.',
    theme: 'Harvest',
    reflection: 'Harvest joy — the feeling when deals close, revenue flows, and the work pays off. That joy is ahead. Keep sowing toward it.',
  },
  {
    reference: 'Leviticus 26:4',
    text: 'Then I will give you your rains in their season, and the land shall yield its increase, and the trees of the field shall yield their fruit.',
    theme: 'Harvest',
    reflection: 'Rain in season. Increase from the land. Fruit from the field. He orchestrates the conditions. You do the planting.',
  },
  {
    reference: 'Psalm 67:5-6',
    text: 'Let the peoples praise you, O God; let all the peoples praise you! The earth has yielded its increase; God, our God, shall bless us.',
    theme: 'Harvest',
    reflection: 'Praise first, then increase. Gratitude unlocks abundance. Thank Him for the territory before it yields, and watch it bless you.',
  },
  {
    reference: 'Joel 2:24',
    text: 'The threshing floors shall be full of grain; the vats shall overflow with wine and oil.',
    theme: 'Harvest',
    reflection: 'Overflowing. Full. Not scraping by — full to overflow. That\'s the promise for the faithful worker. Keep threshing.',
  },
  {
    reference: 'Amos 9:13',
    text: 'Behold, the days are coming, declares the Lord, when the plowman shall overtake the reaper.',
    theme: 'Harvest',
    reflection: 'When the harvest comes so fast that you\'re still plowing while reaping. That season exists. Build the capacity now so you\'re ready.',
  },
  {
    reference: 'Psalm 107:37',
    text: 'They sow fields and plant vineyards and get a fruitful yield.',
    theme: 'Harvest',
    reflection: 'Sow. Plant. Get yield. Three steps. Simple. Not easy — but simple. Your door knocking is planting a vineyard one vine at a time.',
  },
  {
    reference: 'Proverbs 12:11',
    text: 'Whoever works his land will have plenty of bread, but he who follows worthless pursuits lacks sense.',
    theme: 'Harvest',
    reflection: 'Work YOUR land. Not someone else\'s territory. Not some shiny distraction. Your land. Plenty of bread comes from that focus.',
  },
  {
    reference: 'Isaiah 32:20',
    text: 'Happy are you who sow beside all waters, who let the feet of the ox and the donkey range free.',
    theme: 'Harvest',
    reflection: 'The last word for today: happy are those who sow. Not just successful — happy. The act of planting itself is the blessing. Go sow beside all waters.',
  },
]

/** Get today's verse based on day-of-year rotation */
export function getTodayVerse(): BibleVerse {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / 86400000)
  return VERSES[dayOfYear % VERSES.length]
}
