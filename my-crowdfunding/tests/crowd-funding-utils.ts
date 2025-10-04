import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CampaignCancelled,
  CampaignCreated,
  CampaignDonated,
  CampaignPublished,
  CampaignUpdated,
  FundsWithdrawn,
  OwnershipTransferred
} from "../generated/CrowdFunding/CrowdFunding"

export function createCampaignCancelledEvent(
  id: BigInt,
  owner: Address
): CampaignCancelled {
  let campaignCancelledEvent = changetype<CampaignCancelled>(newMockEvent())

  campaignCancelledEvent.parameters = new Array()

  campaignCancelledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  campaignCancelledEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return campaignCancelledEvent
}

export function createCampaignCreatedEvent(
  id: BigInt,
  owner: Address,
  title: string,
  target: BigInt,
  deadline: BigInt,
  category: i32
): CampaignCreated {
  let campaignCreatedEvent = changetype<CampaignCreated>(newMockEvent())

  campaignCreatedEvent.parameters = new Array()

  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("title", ethereum.Value.fromString(title))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("target", ethereum.Value.fromUnsignedBigInt(target))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "deadline",
      ethereum.Value.fromUnsignedBigInt(deadline)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "category",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(category))
    )
  )

  return campaignCreatedEvent
}

export function createCampaignDonatedEvent(
  id: BigInt,
  donator: Address,
  amount: BigInt
): CampaignDonated {
  let campaignDonatedEvent = changetype<CampaignDonated>(newMockEvent())

  campaignDonatedEvent.parameters = new Array()

  campaignDonatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  campaignDonatedEvent.parameters.push(
    new ethereum.EventParam("donator", ethereum.Value.fromAddress(donator))
  )
  campaignDonatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return campaignDonatedEvent
}

export function createCampaignPublishedEvent(
  id: BigInt,
  owner: Address
): CampaignPublished {
  let campaignPublishedEvent = changetype<CampaignPublished>(newMockEvent())

  campaignPublishedEvent.parameters = new Array()

  campaignPublishedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  campaignPublishedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return campaignPublishedEvent
}

export function createCampaignUpdatedEvent(id: BigInt): CampaignUpdated {
  let campaignUpdatedEvent = changetype<CampaignUpdated>(newMockEvent())

  campaignUpdatedEvent.parameters = new Array()

  campaignUpdatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return campaignUpdatedEvent
}

export function createFundsWithdrawnEvent(
  id: BigInt,
  owner: Address,
  amount: BigInt
): FundsWithdrawn {
  let fundsWithdrawnEvent = changetype<FundsWithdrawn>(newMockEvent())

  fundsWithdrawnEvent.parameters = new Array()

  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return fundsWithdrawnEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
