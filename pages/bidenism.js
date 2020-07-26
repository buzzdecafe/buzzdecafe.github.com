(function () {

  const obj2frag = obj => {
    const frag = document.createDocumentFragment()
    Object.entries(obj).forEach(([k, v]) => {
      const opt = document.createElement('option')
      opt.value = v
      opt.appendChild(document.createTextNode(k))
      frag.appendChild(opt)
    })
    return frag
  }

  const arr2frag = (xs, f) => {
    const frag = document.createDocumentFragment()
    xs.forEach((v, i) => {
      const opt = document.createElement('option')
      opt.value = v
      opt.appendChild(document.createTextNode(f(i)))
      frag.appendChild(opt)
    })
    return frag
  }

  const nouns = {
    A: 'milk',
    B: 'ice cream',
    C: 'the pool',
    D: 'roaches',
    E: 'kids',
    F: 'girls',
    G: 'the Chinese',
    H: 'the crisis',
    I: 'a problem',
    J: 'a yo-yo',
    K: 'fat',
    L: 'socialism',
    M: 'Corn Pop',
    N: 'the President',
    O: 'FDR',
    P: 'World War II',
    Q: 'drones',
    R: 'a kill list',
    S: 'war',
    T: 'a position',
    U: 'Amtrak',
    V: 'Delaware',
    W: 'some babe',
    X: 'my son',
    Y: 'a mistake',
    Z: 'America'
  }

  const verbs = {
    Aries: 'hit',
    Taurus: 'touch',
    Gemini: 'smell',
    Cancer: 'sniff',
    Leo: 'bomb',
    Virgo: 'figure',
    Libra: 'beef up',
    Scorpio: 'fight',
    Sagittarius: 'attack',
    Capricorn: 'vote',
    Aquarius: 'text',
    Pisces: 'swim'
  }

  const adjectives = [
    'great',
    'young',
    'pretty',
    'clean',
    'articulate',
    'stupid',
    'darn',
    'bad',
    'bright',
    'good-looking'
  ]

  const garbles = [
    'we gotta',
    'see here Jack',
    'it\'s malarkey',
    'it\'s not gonna happen',
    'it can’t happen',
    'it won’t happen',
    'we have to take care of the cure',
    'no matter what',
    '...what was that?',
    'anyway',
    'that’s totally different',
    'then go vote for Trump',
    'or uh. You know',
    'I never heard of it',
    'I never met her',
    'yes ma’am',
    'I don’t ... I don’t remember',
    'give a shot',
    'if we just',
    'gotta together, we can make America, uh'
  ]

  const noun1 = document.getElementById('noun1')
  const noun2 = document.getElementById('noun2')
  const verb = document.getElementById('verb')
  const adjective = document.getElementById('adjective')
  const depressed = document.getElementById('depressed')
  const bidenize = document.getElementById('bidenize')
  const bidenism = document.getElementById('your-bidenism')
  const out = document.getElementById('out')
  const again = document.getElementById('again')

  noun1.appendChild(obj2frag(nouns))
  noun2.appendChild(obj2frag(nouns))
  verb.appendChild(obj2frag(verbs))
  adjective.appendChild(arr2frag(adjectives, x => x))
  depressed.appendChild(arr2frag(garbles, x => x + 1))

  const onBidenize = e => {
    e.preventDefault()
    bidenism.textContent = 'The thing--the thing you have to understand about America--what America needs is ' +
      noun1.value + ', not ' + noun2.value + '. We gotta ... we gotta ' +
      verb.value + ' this ' + adjective.value + ' issue. I’ve studied history, and you can’t forget: ' +
      depressed.value + '.'
    out.style.display = 'block'
    bidenize.style.display = 'none';
    [noun1, noun2, verb, adjective, depressed].forEach(el => el.disabled = true)
  }

  bidenize.addEventListener('click', onBidenize)

  again.addEventListener('click', e => {
    e.preventDefault()
    window.location.reload()
  })
})()