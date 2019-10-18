import React from 'react'
import './SimplePokemonCard.css'

const SimplePokemonCard = ({ pokemon }) => (
  <div className="simple-pkm-card">
    <h3>{pokemon.name}</h3>
    <img alt={pokemon.name} src={pokemon.sprites.front_default} />
  </div>
)

export default SimplePokemonCard
