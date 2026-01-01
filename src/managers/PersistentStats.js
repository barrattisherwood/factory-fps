/**
 * PersistentStats - Tracks career statistics across all runs
 * Saved in localStorage for meta-progression
 */
export class PersistentStats {
  constructor() {
    this.stats = this.load();
  }
  
  load() {
    const saved = localStorage.getItem('fps_factory_persistent_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load persistent stats, using defaults');
        return this.getDefaultStats();
      }
    }
    return this.getDefaultStats();
  }
  
  getDefaultStats() {
    return {
      runsAttempted: 0,
      runsCompleted: 0,
      bossesDefeated: 0,
      totalKills: 0,
      bestTime: null,
      totalPlayTime: 0,
      favoriteAmmo: null
    };
  }
  
  save() {
    localStorage.setItem('fps_factory_persistent_stats', JSON.stringify(this.stats));
  }
  
  onRunStarted() {
    this.stats.runsAttempted++;
    this.save();
    console.log(`Total runs attempted: ${this.stats.runsAttempted}`);
  }
  
  onRunCompleted(runTime) {
    this.stats.runsCompleted++;
    
    // Track best time
    if (!this.stats.bestTime || runTime < this.stats.bestTime) {
      this.stats.bestTime = runTime;
    }
    
    this.stats.totalPlayTime += runTime;
    this.save();
    console.log(`Total runs completed: ${this.stats.runsCompleted}`);
  }
  
  onBossDefeated() {
    this.stats.bossesDefeated++;
    this.save();
    console.log(`Total bosses defeated: ${this.stats.bossesDefeated}`);
  }
  
  onEnemyKilled() {
    this.stats.totalKills++;
    // Save periodically, not every kill (performance)
    if (this.stats.totalKills % 10 === 0) {
      this.save();
    }
  }
  
  getStats() {
    return { ...this.stats };
  }
  
  reset() {
    localStorage.removeItem('fps_factory_persistent_stats');
    this.stats = this.getDefaultStats();
    console.log('Persistent stats reset');
  }
  
  getBestTimeFormatted() {
    if (!this.stats.bestTime) return 'N/A';
    const minutes = Math.floor(this.stats.bestTime / 60000);
    const seconds = Math.floor((this.stats.bestTime % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  
  getTotalPlayTimeFormatted() {
    const minutes = Math.floor(this.stats.totalPlayTime / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }
}
