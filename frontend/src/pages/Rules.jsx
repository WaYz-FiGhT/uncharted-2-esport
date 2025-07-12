import '../App.css';

function Rules() {
  return (
    <div className="page-center rules-page">
      <section>
        <h1>General</h1>
        <ul>
          <li>Three match formats: Best of 5, Best of 3 or Bo1 (only for 1vs1)</li>
          <li>Three match modes: TDM Only, Plunder Only or Mixed mode</li>
          <li>The team that posts the challenge hosts round&nbsp;1, then hosting rotates</li>
          <li>When hosting, the opposing team chooses the side (Heroes/Villains)</li>
          <li>Teams have 20&nbsp;minutes from the scheduled time to show up. Provide evidence for no-shows</li>
          <li>If a player lags out within 30&nbsp;seconds, restart the match; otherwise continue / If the host lags out, resume with the same score and remaining time</li>
          <li>Cheating or glitching results in disqualification (evidence required) / Intentional suicides are forbidden and result in loss of the map</li>
          <li>If the 2 teams have reported an inconsistent or disputed result, then the match will be in “disputed” status. A multiline text field will be available for you to provide the necessary evidence and justification to show whether you have won or not. If you wish to send images or videos, please do so only by URL in this text field.</li>
          <li>If only one team reports within 3&nbsp;hours, its result becomes official</li>
        </ul>
      </section>

      <section>
        <h2>Banned Boosters</h2>
        <ul>
          <li>Launch Man</li>
          <li>Rocket Man</li>
        </ul>
      </section>

      <section>
        <h2>Banned Skins</h2>
        <ul>
          <li>All skeleton skins</li>
          <li>Navarro</li>
          <li>Roman</li>
        </ul>
      </section>

      <section>
        <h2>Match Setups</h2>
        <h3>3vs3</h3>
        <ul>
          <li><strong>TDM</strong>: Power Weapons decided by teams (default ON), 40&nbsp;kills, 15&nbsp;minutes</li>
          <li><strong>Plunder</strong>: Standard, 5&nbsp;captures, 15&nbsp;minutes</li>
          <li><strong>Turf War</strong>: Standard, 300&nbsp;points, 15&nbsp;minutes</li>
        </ul>
        <h3>4vs4 / 5vs5</h3>
        <ul>
          <li><strong>TDM</strong>: Power Weapons ON, 50&nbsp;kills, 15&nbsp;minutes</li>
          <li><strong>Plunder</strong>: Standard, 5&nbsp;captures, 15&nbsp;minutes</li>
          <li><strong>Turf War</strong>: Standard, 450&nbsp;points, 15&nbsp;minutes</li>
        </ul>
      </section>
    </div>
  );
}

export default Rules;
