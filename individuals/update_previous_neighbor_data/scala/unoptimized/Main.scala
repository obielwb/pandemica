package test.individuals.update_previous_neighbor_data.scala.unoptimized

import scala.collection.mutable.ListBuffer


class Individual {
  private var data: Int = 0
  private var riskProfile: String = ""
  private var interaction: String = ""
  private var personCount: Int = 0
  private var symptomsChecked: String = ""
  private var setting: String = ""
  private var distance: String = ""
  private var duration: Int = 0
  private var theirMask: String = ""
  private var yourMask: String = ""
  private var voice: String = ""

  def getData: Int = data

  def setData(data: Int): Unit = {
    this.data = data
  }

  def getRiskProfile: String = riskProfile

  def setRiskProfile(riskProfile: String): Unit = {
    this.riskProfile = riskProfile
  }

  def getInteraction: String = interaction

  def setInteraction(interaction: String): Unit = {
    this.interaction = interaction
  }

  def getPersonCount: Int = personCount

  def setPersonCount(personCount: Int): Unit = {
    this.personCount = personCount
  }

  def getSymptomsChecked: String = symptomsChecked

  def setSymptomsChecked(symptomsChecked: String): Unit = {
    this.symptomsChecked = symptomsChecked
  }

  def getSetting: String = setting

  def setSetting(setting: String): Unit = {
    this.setting = setting
  }

  def getDistance: String = distance

  def setDistance(distance: String): Unit = {
    this.distance = distance
  }

  def getDuration: Int = duration

  def setDuration(duration: Int): Unit = {
    this.duration = duration
  }

  def getTheirMask: String = theirMask

  def setTheirMask(theirMask: String): Unit = {
    this.theirMask = theirMask
  }

  def getYourMask: String = yourMask

  def setYourMask(yourMask: String): Unit = {
    this.yourMask = yourMask
  }

  def getVoice: String = voice

  def setVoice(voice: String): Unit = {
    this.voice = voice
  }

  def update(
      data: Int,
      riskProfile: String,
      interaction: String,
      personCount: Int,
      symptomsChecked: String,
      setting: String,
      distance: String,
      theirMask: String,
      yourMask: String,
      voice: String
  ): Unit = {
    setData(getData + data)
    setRiskProfile(riskProfile)
    setInteraction(interaction)
    setPersonCount(personCount)
    setSymptomsChecked(symptomsChecked)
    setSetting(setting)
    setDistance(distance)
    setDuration(0)
    setTheirMask(theirMask)
    setYourMask(yourMask)
    setVoice(voice)
  }

  def computeNeighbor(neighborData: Int): Unit = {
    if (neighborData == 0) {
      this.data = 1
    } else {
      this.data = 0
    }
  }
}

object Main {
  def main(args: Array[String]): Unit = {
    val instanceCount = 1223237
    val instances = ListBuffer.fill(instanceCount)(new Individual)

    val size = instances.size * 4 // assuming 32-bit integers, each occupying 4 bytes

    val start = System.currentTimeMillis()

    val iterator = instances.iterator
    var prevInstance: Individual = null
    var currentInstance = iterator.next()
    var nextInstance = iterator.next()

    while (iterator.hasNext) {
      processWindow(prevInstance, currentInstance, nextInstance)

      prevInstance = currentInstance
      currentInstance = nextInstance
      nextInstance = iterator.next()
    }

    val end = System.currentTimeMillis()
    val runtime = (end - start) / 1000.0
    println(s"$size,$runtime")
  }

  def processWindow(prevInstance: Individual, currentInstance: Individual, nextInstance: Individual): Unit = {
    currentInstance.computeNeighbor(if (prevInstance != null) prevInstance.getData else 0)
  }
}
