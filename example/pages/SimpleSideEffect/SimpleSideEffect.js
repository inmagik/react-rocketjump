import React from 'react'
import { useRunRj, rj } from 'react-rocketjump'
import SimplePokemonCard from '../../components/pkm/SimplePokemonCard'

const API_URL = 'https://pokeapi.co/api/v2'

const PokemonState = rj({
  name: 'Pokemon',
  effect: name => fetch(`${API_URL}/pokemon/${name}`).then(r => r.json()),
})

export default function SimpleSideEffect() {
  const [{ data: pokemon }] = useRunRj(PokemonState, ['cubone'])

  return <div>{pokemon && <SimplePokemonCard pokemon={pokemon} />}</div>
}
