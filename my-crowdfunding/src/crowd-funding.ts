import {
  CampaignCancelled as CampaignCancelledEvent,
  CampaignCreated as CampaignCreatedEvent,
  CampaignDonated as CampaignDonatedEvent,
  CampaignPublished as CampaignPublishedEvent,
  CampaignUpdated as CampaignUpdatedEvent,
  FundsWithdrawn as FundsWithdrawnEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  CrowdFunding
} from "../generated/CrowdFunding/CrowdFunding"
import {
  CampaignCancelled,
  CampaignCreated,
  CampaignDonated,
  CampaignPublished,
  CampaignUpdated,
  FundsWithdrawn,
  OwnershipTransferred,
  Activity
} from "../generated/schema"
import { BigInt, Address } from "@graphprotocol/graph-ts"

// Helper function to get campaign title
function getCampaignTitle(campaignId: BigInt, contractAddress: Address): string {
  let contract = CrowdFunding.bind(contractAddress)
  let campaignResult = contract.try_campaigns(campaignId)

  if (campaignResult.reverted) {
    return "Unknown Campaign"
  }

  return campaignResult.value.getTitle()
}

export function handleCampaignCancelled(event: CampaignCancelledEvent): void {
  let entity = new CampaignCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id
  entity.owner = event.params.owner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create Activity entity
  let activity = new Activity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  activity.type = "CANCELLED"
  activity.campaignId = event.params.id
  activity.campaignTitle = getCampaignTitle(event.params.id, event.address)
  activity.user = event.params.owner
  activity.amount = null
  activity.blockNumber = event.block.number
  activity.blockTimestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.save()
}

export function handleCampaignCreated(event: CampaignCreatedEvent): void {
  let entity = new CampaignCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id
  entity.owner = event.params.owner
  entity.title = event.params.title
  entity.target = event.params.target
  entity.deadline = event.params.deadline
  entity.category = event.params.category

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create Activity entity
  let activity = new Activity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  activity.type = "CREATED"
  activity.campaignId = event.params.id
  activity.campaignTitle = event.params.title
  activity.user = event.params.owner
  activity.amount = null
  activity.blockNumber = event.block.number
  activity.blockTimestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.save()
}

export function handleCampaignDonated(event: CampaignDonatedEvent): void {
  let entity = new CampaignDonated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id
  entity.donator = event.params.donator
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create Activity entity
  let activity = new Activity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  activity.type = "DONATION"
  activity.campaignId = event.params.id
  activity.campaignTitle = getCampaignTitle(event.params.id, event.address)
  activity.user = event.params.donator
  activity.amount = event.params.amount
  activity.blockNumber = event.block.number
  activity.blockTimestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.save()
}

export function handleCampaignPublished(event: CampaignPublishedEvent): void {
  let entity = new CampaignPublished(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id
  entity.owner = event.params.owner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create Activity entity
  let activity = new Activity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  activity.type = "PUBLISHED"
  activity.campaignId = event.params.id
  activity.campaignTitle = getCampaignTitle(event.params.id, event.address)
  activity.user = event.params.owner
  activity.amount = null
  activity.blockNumber = event.block.number
  activity.blockTimestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.save()
}

export function handleCampaignUpdated(event: CampaignUpdatedEvent): void {
  let entity = new CampaignUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create Activity entity
  let activity = new Activity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  activity.type = "UPDATED"
  activity.campaignId = event.params.id
  activity.campaignTitle = getCampaignTitle(event.params.id, event.address)
  activity.user = event.transaction.from
  activity.amount = null
  activity.blockNumber = event.block.number
  activity.blockTimestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.save()
}

export function handleFundsWithdrawn(event: FundsWithdrawnEvent): void {
  let entity = new FundsWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id
  entity.owner = event.params.owner
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create Activity entity
  let activity = new Activity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  activity.type = "WITHDRAWAL"
  activity.campaignId = event.params.id
  activity.campaignTitle = getCampaignTitle(event.params.id, event.address)
  activity.user = event.params.owner
  activity.amount = event.params.amount
  activity.blockNumber = event.block.number
  activity.blockTimestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
