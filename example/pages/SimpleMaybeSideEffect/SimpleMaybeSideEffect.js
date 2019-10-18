import React, { Fragment, useState } from 'react'
import { ajax } from 'rxjs/ajax'
import { useRunRj, rj, deps } from 'react-rocketjump'
import SimplePokemonCard from '../../components/pkm/SimplePokemonCard'
import './SimpleMaybeSideEffect.css'

const API_URL = 'https://pokeapi.co/api/v2'

const PokemonState = rj({
  name: 'Pokemon',
  effect: name => ajax.getJSON(`${API_URL}/pokemon/${name}`),
})

const PokemonEvolutionChain = rj({
  name: 'PokemonEvolutionChain',
  effect: speciesUrl =>
    fetch(speciesUrl)
      .then(r => r.json())
      .then(specie => fetch(specie.evolution_chain.url))
      .then(r => r.json()),
})

export default function SimpleMaybeSideEffect() {
  const [name, setName] = useState('eevee')
  console.log('X', name)
  const [{ data: pokemon }] = useRunRj(PokemonState, [deps.maybe(name)], false)
  const [{ data: evolutionChain }] = useRunRj(PokemonEvolutionChain, [
    deps.maybeGet(pokemon, 'species.url'),
  ])

  function renderEvolution(evolution, isRoot = true) {
    return (
      <div className={isRoot ? 'evolution-root' : 'evolution-group'}>
        {isRoot && (
          <div
            onClick={() => setName(evolution.species.name)}
            className="evolution-name"
          >
            {evolution.species.name}
          </div>
        )}
        {isRoot && evolution.evolves_to.length > 0 && (
          <div className="arrow-evolution">{'->'}</div>
        )}
        <div className="evolution-list">
          {evolution.evolves_to.map(evolution => (
            <div key={evolution.species.name} className="evolution-group">
              <div
                onClick={() => setName(evolution.species.name)}
                className="evolution-name"
              >
                {evolution.species.name}
              </div>
              {evolution.evolves_to.length > 0 && (
                <>
                  <div className="arrow-evolution">{'->'}</div>
                  {renderEvolution(evolution, false)}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
      {pokemon && <SimplePokemonCard pokemon={pokemon} />}
      <div className="evolution-tree">
        {evolutionChain && renderEvolution(evolutionChain.chain)}
      </div>
    </div>
  )
}
