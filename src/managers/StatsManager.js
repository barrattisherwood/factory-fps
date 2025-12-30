/**
 * StatsManager - Tracks gameplay statistics
 */
export class StatsManager {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.stats = {
      startTime: Date.now(),
      endTime: null,
      
      enemiesKilled: 0,
      enemiesKilledByType: { standard: 0, shielded: 0 },
      
      shotsFired: 0,
      shotsHit: 0,
      
      resourcesCollected: { metal: 0, energy: 0 },
      
      ammoUsed: { kinetic: 0, flux: 0 },
      
      wavesCompleted: 0,
      
      damageTaken: 0
    };
  }
  
  onEnemyKilled(enemyType) {
    this.stats.enemiesKilled++;
    if (this.stats.enemiesKilledByType[enemyType] !== undefined) {
      this.stats.enemiesKilledByType[enemyType]++;
    }
  }
  
  onShotFired(ammoType) {
    this.stats.shotsFired++;
    if (this.stats.ammoUsed[ammoType] !== undefined) {
      this.stats.ammoUsed[ammoType]++;
    }
  }
  
  onShotHit() {
    this.stats.shotsHit++;
  }
  
  onResourceCollected(type, amount) {
    if (this.stats.resourcesCollected[type] !== undefined) {
      this.stats.resourcesCollected[type] += amount;
    }
  }
  
  onWaveCompleted(waveNumber) {
    this.stats.wavesCompleted = waveNumber;
  }
  
  onDamageTaken(amount) {
    this.stats.damageTaken += amount;
  }
  
  getAccuracy() {
    if (this.stats.shotsFired === 0) return 0;
    return ((this.stats.shotsHit / this.stats.shotsFired) * 100).toFixed(1);
  }
  
  getFavoriteAmmo() {
    const kinetic = this.stats.ammoUsed.kinetic;
    const flux = this.stats.ammoUsed.flux;
    const total = kinetic + flux;
    
    if (total === 0) return 'None';
    
    if (kinetic > flux) {
      return `Kinetic (${((kinetic/total) * 100).toFixed(0)}%)`;
    } else {
      return `Flux (${((flux/total) * 100).toFixed(0)}%)`;
    }
  }
  
  getPlayTime() {
    const endTime = this.stats.endTime || Date.now();
    const duration = endTime - this.stats.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  
  finalize() {
    this.stats.endTime = Date.now();
  }
  
  getStats() {
    return { ...this.stats };
  }
}
