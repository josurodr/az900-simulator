import { useState, useMemo, useEffect, useCallback } from "react";

// ─── Question Bank ────────────────────────────────────────────────────────────
const ALL_QUESTIONS = [
  // ── Single Choice ──────────────────────────────────────────────────────────
  {
    id: 2,
    type: "single",
    topic: "Storage",
    topicLabel: "Storage & Redundancy",
    question:
      "Your company plans to migrate all on-premises data to Azure. The data must remain available if a single datacenter fails AND if multiple Azure datacenters in the same geographic area become unavailable. You need to identify the redundancy option that meets the requirements while minimizing costs.\n\nWhich storage redundancy option should you recommend?",
    options: [
      "A. Geo-redundant storage (GRS)",
      "B. Read-access geo-redundant storage (RA-GRS)",
      "C. Zone-redundant storage (ZRS)",
      "D. Locally redundant storage (LRS)",
    ],
    answer: "B",
    answerText: "B. Read-access geo-redundant storage (RA-GRS)",
    explanation:
      "RA-GRS replicates data to a secondary region AND allows READ access to that secondary copy without requiring a failover. This satisfies both requirements (datacenter failure + regional failure) at lower cost than a full active-active setup. Plain GRS also geo-replicates but does NOT allow read access to the secondary region until a failover is triggered.",
    confidence: "high",
  },
  {
    id: 7,
    type: "single",
    topic: "AppService",
    topicLabel: "Azure App Service Plans",
    question:
      "You plan to deploy 10 web apps to Azure. The web apps must meet the following requirements:\n• Support custom domains\n• Use at least 10 GB of storage\n• Run on dedicated compute instances\n• Support load balancing\n• Minimize costs\n\nWhich App Service plan should you use?",
    options: ["A. Standard", "B. Basic", "C. Free", "D. Shared"],
    answer: "A",
    answerText: "A. Standard",
    explanation:
      "Standard meets ALL requirements: custom domains ✓, 50 GB storage (≥10 GB) ✓, dedicated instances ✓, load balancing ✓ — and is cheaper than Premium/Isolated. Basic supports custom domains and dedicated instances but does NOT include load balancing/auto-scale.",
    confidence: "high",
  },
  {
    id: 9,
    type: "single",
    topic: "AppService",
    topicLabel: "Azure App Service Plans",
    question:
      "You plan to deploy a web app accessible at miami.weyland.com. Requirements:\n• 2 instances\n• SSL certificates\n• At least 12 GB of storage\n• Minimum cost\n\nWhich App Service plan should you use?",
    options: ["A. Standard", "B. Basic", "C. Premium", "D. Isolated"],
    answer: "A",
    answerText: "A. Standard",
    explanation:
      "Standard supports SSL, custom domains, multiple instances (up to 10), and 50 GB storage — satisfying the 12 GB requirement. Basic only provides 10 GB storage (insufficient). Premium and Isolated have more capacity but cost significantly more.",
    confidence: "high",
  },

  // ── Yes / No ───────────────────────────────────────────────────────────────
  {
    id: 3,
    type: "yesno",
    topic: "Support",
    topicLabel: "Azure Support Plans",
    question:
      "Your company needs an Azure support plan that provides best-practice information, health status and notifications, and access to an Azure support team for advisory support.\n\nSolution: You recommend a Professional Direct support plan.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Community marks this B (No) with a 55/44 split. While Professional Direct does include advisory features, the question scenario can be satisfied by lower-tier plans. The debated nature reflects real exam ambiguity.",
    confidence: "medium",
  },
  {
    id: 4,
    type: "yesno",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to migrate all virtual machines to Azure.\n\nSolution: You recommend using a Software as a Service (SaaS) cloud service model.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "SaaS delivers software applications over the internet (e.g., Office 365). To deploy and manage virtual machines you need IaaS, which provides control over VMs, networking, and storage.",
    confidence: "high",
  },
  {
    id: 5,
    type: "yesno",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to migrate all virtual machines to Azure.\n\nSolution: You recommend using a Platform as a Service (PaaS) cloud service model.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "PaaS provides a platform for building applications without managing underlying infrastructure. To deploy specific virtual machines you need IaaS — PaaS abstracts the VM layer away.",
    confidence: "high",
  },
  {
    id: 6,
    type: "yesno",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to migrate all virtual machines to Azure.\n\nSolution: You recommend using an Infrastructure as a Service (IaaS) cloud service model.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "IaaS is the correct model for deploying and managing virtual machines. Azure Virtual Machines is an IaaS service providing virtualized compute, storage, and networking.",
    confidence: "high",
  },
  {
    id: 8,
    type: "yesno",
    topic: "Identity",
    topicLabel: "Azure Identity & Azure AD",
    question:
      "Your company has offices in New York and Los Angeles with a single Azure Active Directory tenant. You plan to segment Azure resources by office location.\n\nSolution: You create multiple Azure AD directories, one per office location.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Multiple Azure AD directories complicate identity management unnecessarily. Resource segmentation by location is done with multiple subscriptions, management groups, resource groups, and RBAC — not separate Azure AD tenants.",
    confidence: "high",
  },
  {
    id: 10,
    type: "yesno",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "Your company is migrating all virtual machines to an Azure pay-as-you-go subscription. You must ensure the solution uses the correct expenditure model.\n\nSolution: You should recommend the use of the elastic expenditure model.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "'Elastic expenditure model' is not a valid Azure term. Azure has two expenditure models: Capital Expenditure (CapEx) for upfront hardware, and Operational Expenditure (OpEx) / consumption-based for pay-as-you-go. The correct answer is OpEx/consumption-based.",
    confidence: "high",
  },

  // ── Drag & Drop (Select and Place) ─────────────────────────────────────────
  {
    id: 1001,
    type: "dragdrop",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Match each Azure service to its cloud service model. Drag the service model to the correct Azure service.\n\n(Select and Place)",
    items: ["IaaS", "PaaS", "SaaS"],
    targets: ["Azure Virtual Machines", "Azure App Service", "Microsoft 365"],
    answer: {
      "Azure Virtual Machines": "IaaS",
      "Azure App Service": "PaaS",
      "Microsoft 365": "SaaS",
    },
    explanation:
      "Azure VMs = IaaS (you manage OS, runtime, apps). Azure App Service = PaaS (you manage only your code/data; Microsoft manages the platform). Microsoft 365 = SaaS (fully managed application delivered over the internet).",
    confidence: "high",
  },
  {
    id: 1002,
    type: "dragdrop",
    topic: "Storage",
    topicLabel: "Storage & Redundancy",
    question:
      "Match each Azure storage service to its best use case. Drag the service to the correct use case.\n\n(Select and Place)",
    items: ["Azure Blob Storage", "Azure Files", "Azure Disk Storage", "Azure Queue Storage"],
    targets: [
      "Unstructured data (images, videos, documents)",
      "Persistent disks for Azure VMs",
      "Fully managed file shares (SMB/NFS)",
      "Decoupled message passing between services",
    ],
    answer: {
      "Unstructured data (images, videos, documents)": "Azure Blob Storage",
      "Persistent disks for Azure VMs": "Azure Disk Storage",
      "Fully managed file shares (SMB/NFS)": "Azure Files",
      "Decoupled message passing between services": "Azure Queue Storage",
    },
    explanation:
      "Blob = unstructured object storage. Disk Storage = managed disks attached to VMs. Azure Files = fully managed SMB/NFS shares for lift-and-shift file servers. Queue Storage = async message queuing between application components.",
    confidence: "high",
  },
  {
    id: 1003,
    type: "dragdrop",
    topic: "Support",
    topicLabel: "Azure Support Plans",
    question:
      "Match each feature to the minimum Azure support plan that includes it. Drag the support plan name to the correct feature.\n\n(Select and Place)",
    items: ["Developer", "Standard", "Professional Direct", "Premier / Unified"],
    targets: [
      "24/7 access to technical support via phone and email",
      "Architecture guidance from Azure experts (advisory)",
      "Business-critical rapid response (< 15 min for Sev A)",
      "Trial/non-production support only (business hours)",
    ],
    answer: {
      "Trial/non-production support only (business hours)": "Developer",
      "24/7 access to technical support via phone and email": "Standard",
      "Architecture guidance from Azure experts (advisory)": "Professional Direct",
      "Business-critical rapid response (< 15 min for Sev A)": "Premier / Unified",
    },
    explanation:
      "Developer: business hours, no production SLA. Standard: 24/7 phone+email, production SLA. Professional Direct: adds proactive advisory, Azure Advisor reviews. Premier/Unified: fastest SLAs, dedicated TAM.",
    confidence: "high",
  },

  // ── Dropdown (fill in the blank) ───────────────────────────────────────────
  {
    id: 1201,
    type: "dropdown",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "Complete the following statements about Azure expenditure models:",
    segments: [
      { text: "Purchasing servers and hardware upfront for your own datacenter is an example of " },
      {
        blank: "BLANK1",
        options: ["CapEx", "OpEx", "consumption-based spending"],
        answer: "CapEx",
      },
      { text: ". Paying only for the cloud resources you consume each month is an example of " },
      {
        blank: "BLANK2",
        options: ["CapEx", "OpEx", "reserved capacity spending"],
        answer: "OpEx",
      },
      { text: "." },
    ],
    explanation:
      "CapEx (Capital Expenditure) = upfront investment in physical infrastructure. OpEx (Operational Expenditure) = ongoing costs for services consumed, like pay-as-you-go Azure subscriptions.",
    confidence: "high",
  },
  {
    id: 1202,
    type: "dropdown",
    topic: "Identity",
    topicLabel: "Azure Identity & Azure AD",
    question:
      "Complete the following statements about Azure AD concepts:",
    segments: [
      { text: "A " },
      {
        blank: "BLANK1",
        options: ["tenant", "subscription", "resource group"],
        answer: "tenant",
      },
      { text: " is a dedicated instance of Azure Active Directory that an organization receives when it signs up for Microsoft cloud services. Multiple Azure " },
      {
        blank: "BLANK2",
        options: ["tenants", "subscriptions", "resource groups"],
        answer: "subscriptions",
      },
      { text: " can be associated with a single Azure AD tenant." },
    ],
    explanation:
      "An Azure AD tenant is a single organization's dedicated directory instance. Multiple Azure subscriptions (billing containers) can trust and use the same Azure AD tenant for authentication.",
    confidence: "high",
  },
  {
    id: 1203,
    type: "dropdown",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "Complete the following statements about cloud deployment models:",
    segments: [
      { text: "Resources that run entirely on your own on-premises hardware are part of a " },
      {
        blank: "BLANK1",
        options: ["private cloud", "public cloud", "hybrid cloud"],
        answer: "private cloud",
      },
      { text: " deployment. Resources shared across multiple organizations over the internet are part of a " },
      {
        blank: "BLANK2",
        options: ["private cloud", "public cloud", "hybrid cloud"],
        answer: "public cloud",
      },
      { text: ". A combination of both on-premises and cloud resources is called a " },
      {
        blank: "BLANK3",
        options: ["private cloud", "public cloud", "hybrid cloud"],
        answer: "hybrid cloud",
      },
      { text: "." },
    ],
    explanation:
      "Private cloud: on-premises, single organization. Public cloud: shared infrastructure, multi-tenant (e.g., Azure). Hybrid cloud: combination of private and public, connected via VPN or ExpressRoute.",
    confidence: "high",
  },

  // ── Matching / Association ─────────────────────────────────────────────────
  {
    id: 1301,
    type: "matching",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "Match each Azure benefit to its correct description. (Each benefit may be used only once.)",
    leftItems: [
      "High Availability",
      "Scalability",
      "Elasticity",
      "Fault Tolerance",
    ],
    rightItems: [
      "The ability to automatically increase or decrease resources based on demand",
      "The ability to continue operating even when one or more components fail",
      "The ability to keep services running with minimal downtime",
      "The ability to increase capacity to handle growing workload",
    ],
    answer: {
      "High Availability": "The ability to keep services running with minimal downtime",
      "Scalability": "The ability to increase capacity to handle growing workload",
      "Elasticity": "The ability to automatically increase or decrease resources based on demand",
      "Fault Tolerance": "The ability to continue operating even when one or more components fail",
    },
    explanation:
      "High Availability = minimal downtime SLAs. Scalability = growing capacity (scale up/out). Elasticity = dynamic scaling up AND down with demand. Fault Tolerance = system keeps running despite component failures.",
    confidence: "high",
  },
  {
    id: 1302,
    type: "matching",
    topic: "Governance",
    topicLabel: "Azure Governance & Compliance",
    question:
      "Match each Azure governance tool to its primary purpose.",
    leftItems: [
      "Azure Policy",
      "Azure Blueprints",
      "Management Groups",
      "Resource Locks",
    ],
    rightItems: [
      "Prevent accidental deletion or modification of critical resources",
      "Enforce organizational standards and assess compliance at scale",
      "Deploy a repeatable set of Azure resources and policies",
      "Organize subscriptions into a hierarchy for unified governance",
    ],
    answer: {
      "Azure Policy": "Enforce organizational standards and assess compliance at scale",
      "Azure Blueprints": "Deploy a repeatable set of Azure resources and policies",
      "Management Groups": "Organize subscriptions into a hierarchy for unified governance",
      "Resource Locks": "Prevent accidental deletion or modification of critical resources",
    },
    explanation:
      "Azure Policy: define and enforce rules. Blueprints: package policies + ARM templates for repeatable environments. Management Groups: hierarchy above subscriptions for policy inheritance. Resource Locks: CanNotDelete or ReadOnly to prevent accidents.",
    confidence: "high",
  },

  // ── Q11–Q40 from images ────────────────────────────────────────────────────
  {
    id: 11,
    type: "yesno",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "Your company is planning to migrate all their virtual machines to an Azure pay-as-you-go subscription. The virtual machines are currently hosted on Hyper-V hosts in a data center. You are required to make sure that the intended Azure solution uses the correct expenditure model.\n\nSolution: You should recommend the use of the scalable expenditure model.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "'Scalable expenditure model' is not a recognized Azure term. The two valid Azure expenditure models are CapEx (Capital Expenditure — upfront hardware costs) and OpEx (Operational Expenditure — pay-as-you-go/consumption-based). A pay-as-you-go subscription uses OpEx. 'Scalable' describes a cloud property, not an expenditure model.",
    confidence: "high",
  },
  {
    id: 12,
    type: "yesno",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "Your company is planning to migrate all their virtual machines to an Azure pay-as-you-go subscription. The virtual machines are currently hosted on Hyper-V hosts in a data center. You are required to make sure that the intended Azure solution uses the correct expenditure model.\n\nSolution: You should recommend the use of the operational expenditure model.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "Operational Expenditure (OpEx) is exactly the right model for a pay-as-you-go Azure subscription. Instead of investing in hardware upfront (CapEx), you pay for what you consume monthly. Moving from on-premises Hyper-V to Azure is a classic CapEx → OpEx transition. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 13,
    type: "yesno",
    topic: "AI",
    topicLabel: "Azure AI & Machine Learning",
    question:
      "You are required to deploy an Artificial Intelligence (AI) solution in Azure. You want to make sure that you are able to build, test, and deploy predictive analytics for the solution.\n\nSolution: You should make use of Azure Cosmos DB.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Azure Cosmos DB is a globally distributed, multi-model NoSQL database service. It is NOT designed for building, testing, or deploying predictive analytics or AI models. The correct service for building and deploying predictive analytics/ML models is Azure Machine Learning. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 14,
    type: "yesno",
    topic: "Identity",
    topicLabel: "Azure Identity & Azure AD",
    question:
      "Your company's Active Directory forest includes thousands of user accounts. All network resources will be migrated to Azure, and the on-premises data center will be retired. You are required to employ a strategy that reduces the effect on users once the migration is completed.\n\nSolution: You plan to sync all the Active Directory user accounts to Azure Active Directory (Azure AD).\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "Syncing on-premises Active Directory to Azure AD (via Azure AD Connect) allows users to use the same credentials they already know to access Azure resources. This is the standard 'hybrid identity' strategy and minimizes disruption because users don't need new passwords or accounts. Community consensus: 92% agree.",
    confidence: "high",
  },
  {
    id: 15,
    type: "yesno",
    topic: "AI",
    topicLabel: "Azure AI & Machine Learning",
    question:
      "You are required to deploy an Artificial Intelligence (AI) solution in Azure. You want to make sure that you are able to build, test, and deploy predictive analytics for the solution.\n\nSolution: You should make use of Azure Machine Learning Studio.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "⚠️ DEBATED (60% Yes / 40% No). The official answer is A (Yes). Azure Machine Learning Studio (and the modern Azure Machine Learning service) is specifically designed for building, testing, and deploying predictive analytics and ML models. However, 'Machine Learning Studio (classic)' has been retired — the current service is simply 'Azure Machine Learning.' For AZ-900 exam purposes, Yes is the accepted answer since Azure ML is the correct tool for this scenario.",
    confidence: "medium",
  },
  {
    id: 16,
    type: "yesno",
    topic: "Governance",
    topicLabel: "Azure Governance & Compliance",
    question:
      "Your company's infrastructure includes business units that each need a large number of identical Azure resources for everyday operation. You are required to sanction a strategy to create Azure resources automatically.\n\nSolution: You recommend that the Azure API Management service be included in the strategy.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Azure API Management is a service for publishing, securing, and managing APIs. It has nothing to do with automatically creating Azure infrastructure resources. For automatic, repeatable resource creation, you should use ARM Templates, Azure Blueprints, or Bicep. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 17,
    type: "yesno",
    topic: "Governance",
    topicLabel: "Azure Governance & Compliance",
    question:
      "Your company's infrastructure includes business units that each need a large number of identical Azure resources for everyday operation. You are required to sanction a strategy to create Azure resources automatically.\n\nSolution: You recommend that management groups be included in the strategy.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "⚠️ DEBATED (66% No / 34% Yes). Management groups are organizational containers for grouping subscriptions to apply governance policies and RBAC at scale — they do NOT create resources automatically. For automated resource creation, the right tools are ARM Templates or Azure Blueprints. My view: B (No) is correct. Management groups organize and govern, they don't deploy.",
    confidence: "medium",
  },
  {
    id: 18,
    type: "yesno",
    topic: "Governance",
    topicLabel: "Azure Governance & Compliance",
    question:
      "Your company's infrastructure includes business units that each need a large number of identical Azure resources for everyday operation. You are required to sanction a strategy to create Azure resources automatically.\n\nSolution: You recommend that Azure Resource Manager templates be included in the strategy.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "ARM templates (Azure Resource Manager templates) are JSON-based infrastructure-as-code files that define and deploy Azure resources in a declarative, repeatable way. They are exactly the right tool for automatically creating identical sets of Azure resources across multiple business units. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 19,
    type: "yesno",
    topic: "Compute",
    topicLabel: "Azure Compute & Availability",
    question:
      "You are tasked with deploying a critical LOB application on a virtual machine to Azure. The deployment strategy must allow for a guaranteed availability of 99.99%. You need to make sure that the strategy requires as few virtual machines and availability zones as possible.\n\nSolution: You include two virtual machines and one availability zone in your strategy.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "To achieve 99.99% SLA for VMs in Azure, you need at least 2 VMs deployed across at least 2 Availability Zones. Using only 1 availability zone means both VMs are in the same zone — if that zone fails, both VMs go down, which cannot guarantee 99.99%. The minimum configuration is 2 VMs × 2 zones. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 20,
    type: "yesno",
    topic: "Compute",
    topicLabel: "Azure Compute & Availability",
    question:
      "You are tasked with deploying a critical LOB application on a virtual machine to Azure. The deployment strategy must allow for a guaranteed availability of 99.99%. You need to make sure that the strategy requires as few virtual machines and availability zones as possible.\n\nSolution: You include one virtual machine and two availability zones in your strategy.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "A single virtual machine is a single point of failure regardless of how many availability zones are specified — you cannot spread one VM across two zones. To achieve 99.99% SLA you need at least 2 VMs, each in a different availability zone. 1 VM = no redundancy = no 99.99% guarantee. Community consensus: 85% agree.",
    confidence: "high",
  },

  // ── Q21–Q40 ────────────────────────────────────────────────────────────────
  {
    id: 21,
    type: "yesno",
    topic: "Compute",
    topicLabel: "Azure Compute & Availability",
    question:
      "You are tasked with deploying a critical LOB application on a virtual machine to Azure. The deployment strategy must allow for a guaranteed availability of 99.99%. You need to make sure that the strategy requires as few virtual machines and availability zones as possible.\n\nSolution: You include two virtual machines and two availability zones in your strategy.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "Two VMs across two Availability Zones is the minimum configuration that satisfies the 99.99% SLA requirement. Azure guarantees 99.99% uptime for VMs when at least two instances are deployed in two or more Availability Zones in the same region. This is also the configuration that uses the fewest resources possible to hit that SLA. Community consensus: 91% agree.",
    confidence: "high",
  },
  {
    id: 22,
    type: "yesno",
    topic: "Compute",
    topicLabel: "Azure Compute & Availability",
    question:
      "Your company's developers intend to deploy a large number of custom virtual machines on a weekly basis and remove them during the same week. 60% have Windows Server 2016, 40% have Ubuntu Linux. You need to reduce the administrative effort for this process.\n\nSolution: You recommend the use of Microsoft Managed Desktop.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Microsoft Managed Desktop is a cloud-based endpoint management service for corporate Windows 10/11 devices (laptops, desktops) — it has nothing to do with managing custom Azure VMs deployed for development. The correct service for this scenario is Azure DevTest Labs, which allows developers to quickly create, configure, and auto-delete VMs. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 23,
    type: "yesno",
    topic: "Compute",
    topicLabel: "Azure Compute & Availability",
    question:
      "Your company's developers intend to deploy a large number of custom virtual machines on a weekly basis and remove them during the same week. 60% have Windows Server 2016, 40% have Ubuntu Linux. You need to reduce the administrative effort for this process.\n\nSolution: You recommend the use of Azure Reserved Virtual Machine (VM) Instances.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Azure Reserved VM Instances are a billing/pricing commitment (1 or 3 year reservation) that saves money on long-running workloads. They do not help with reducing administrative effort for deploying and removing short-lived VMs. Reserved instances are actually the opposite of what's needed — they're for VMs that run continuously, not ones created and deleted weekly. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 24,
    type: "yesno",
    topic: "Compute",
    topicLabel: "Azure Compute & Availability",
    question:
      "Your company's developers intend to deploy a large number of custom virtual machines on a weekly basis and remove them during the same week. 60% have Windows Server 2016, 40% have Ubuntu Linux. You need to reduce the administrative effort for this process.\n\nSolution: You recommend the use of Azure DevTest Labs.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "Azure DevTest Labs is purpose-built for this scenario. It allows developers to self-service create VMs from pre-configured templates (reducing admin effort), enforces automatic shutdown/deletion policies (handling the weekly cleanup), and supports both Windows and Linux. It provides a managed environment for dev/test workloads with cost controls. Community consensus: 86% agree.",
    confidence: "high",
  },
  {
    id: 25,
    type: "single",
    topic: "Networking",
    topicLabel: "Azure Networking",
    question:
      "Your company has virtual machines (VMs) hosted in Azure on a virtual network named VNet1. The company has users that work remotely and require access to the VMs on VNet1.\n\nWhat should you do?",
    options: [
      "A. Configure a Site-to-Site (S2S) VPN.",
      "B. Configure a VNet-to-VNet VPN.",
      "C. Configure a Point-to-Site (P2S) VPN.",
      "D. Configure DirectAccess on a Windows Server 2012 server VM.",
      "E. Configure a Multi-Site VPN.",
    ],
    answer: "C",
    answerText: "C. Configure a Point-to-Site (P2S) VPN.",
    explanation:
      "Point-to-Site (P2S) VPN is designed for individual remote workers connecting from their personal devices to an Azure VNet over the internet. Site-to-Site (S2S) is for connecting an entire on-premises network to Azure. VNet-to-VNet connects two Azure VNets. DirectAccess requires Windows Server infrastructure. P2S is the correct choice for remote workers. Community consensus: 95% agree.",
    confidence: "high",
  },
  {
    id: 26,
    type: "yesno",
    topic: "Security",
    topicLabel: "Azure Security",
    question:
      "Your company is automating server deployment to Azure and is concerned that administrative credentials could be exposed during this process. You must ensure administrative credentials are encrypted during deployment.\n\nSolution: You recommend the use of Azure Information Protection.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Azure Information Protection (AIP) is a cloud-based solution for classifying and protecting documents and emails with sensitivity labels. It is NOT designed for storing or encrypting credentials/secrets used during automated deployments. The correct service is Azure Key Vault, which securely stores secrets, certificates, and keys and can be accessed programmatically during automated deployments. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 27,
    type: "yesno",
    topic: "Security",
    topicLabel: "Azure Security",
    question:
      "Your company is automating server deployment to Azure and is concerned that administrative credentials could be exposed during this process. You must ensure administrative credentials are encrypted during deployment.\n\nSolution: You recommend the use of Azure Multi-Factor Authentication (MFA).\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Azure MFA adds a second authentication factor (phone, app, etc.) for user sign-ins — it does not encrypt or protect credentials stored for automated deployments. MFA is an access control, not a secret storage mechanism. Azure Key Vault is the correct solution for encrypting and securely storing administrative credentials used in automation. Community consensus: 97% agree.",
    confidence: "high",
  },
  {
    id: 28,
    type: "dragdrop",
    topic: "Governance",
    topicLabel: "Azure Governance & Compliance",
    question:
      "DRAG DROP — The company would like to develop a cloud solution using Azure Government. Azure Government can only be used by certain types of clients.\n\nWhich of the following are types of customers that can make use of Azure Government? Drag the correct options to the Answer area.\n\n(Select and Place — choose the 2 correct customer types)",
    items: [
      "A government contractor from any country",
      "A government entity from any country",
      "A European government contractor",
      "A European government entity",
      "A United States government contractor",
      "A United States government entity",
    ],
    targets: ["Eligible customer type 1", "Eligible customer type 2"],
    answer: {
      "Eligible customer type 1": "A United States government contractor",
      "Eligible customer type 2": "A United States government entity",
    },
    explanation:
      "Azure Government is a sovereign cloud specifically for US federal, state, local, and tribal government entities and their contractors. It is physically isolated from commercial Azure and only accessible to US-screened personnel. Non-US government entities (European, etc.) use the standard Azure commercial regions or their own regional sovereign clouds (Azure Germany, Azure China). 'A government contractor from any country' is wrong — only US contractors qualify.",
    confidence: "high",
  },
  {
    id: 29,
    type: "yesno",
    topic: "Identity",
    topicLabel: "Azure Identity & Azure AD",
    question:
      "Your company has an Azure Active Directory (Azure AD) environment. Users occasionally connect to Azure AD via the Internet. You need to ensure that users who connect to Azure AD from an unidentified IP address are automatically encouraged to change their passwords.\n\nSolution: You configure the use of Azure AD Identity Protection.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "Azure AD Identity Protection detects risk events including sign-ins from anonymous/unfamiliar IP addresses, impossible travel, and leaked credentials. It can automatically trigger risk-based Conditional Access policies that require users to change their password or perform MFA when a risky sign-in is detected. This is exactly the intended use case for Identity Protection. Community consensus: 81% agree.",
    confidence: "high",
  },
  {
    id: 30,
    type: "yesno",
    topic: "Identity",
    topicLabel: "Azure Identity & Azure AD",
    question:
      "Your company has an Azure Active Directory (Azure AD) environment. Users occasionally connect to Azure AD via the Internet. You need to ensure that users who connect to Azure AD from an unidentified IP address are automatically encouraged to change their passwords.\n\nSolution: You configure the use of Azure AD Privileged Identity Management.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Azure AD Privileged Identity Management (PIM) manages, controls, and monitors access to privileged admin roles (like Global Administrator, Security Administrator). It provides just-in-time privileged access and approval workflows. PIM does NOT detect risky sign-ins from unidentified IPs or trigger password change policies. That is the job of Azure AD Identity Protection. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 31,
    type: "yesno",
    topic: "Networking",
    topicLabel: "Azure Networking",
    question:
      "You are planning a strategy to deploy numerous web servers and database servers to Azure. The strategy should allow connection types between the web servers and database servers to be controlled.\n\nSolution: You include Network Security Groups (NSGs) in your strategy.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "Network Security Groups (NSGs) contain inbound and outbound security rules that allow or deny network traffic based on source/destination IP, port, and protocol. Applying NSGs to subnets (web tier and database tier) is the standard Azure pattern to control which connection types are allowed between web servers and database servers. Community consensus: 97% agree.",
    confidence: "high",
  },
  {
    id: 32,
    type: "yesno",
    topic: "Networking",
    topicLabel: "Azure Networking",
    question:
      "You are planning a strategy to deploy numerous web servers and database servers to Azure. The strategy should allow connection types between the web servers and database servers to be controlled.\n\nSolution: You include a local network gateway in your strategy.\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "A local network gateway is an Azure resource that represents the on-premises VPN device's configuration (IP address and address space) in a Site-to-Site VPN connection. It is used to connect your on-premises datacenter to Azure — it has no role in controlling traffic between servers deployed within Azure. NSGs are the correct tool for that. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 33,
    type: "yesno",
    topic: "Identity",
    topicLabel: "Azure Identity & Azure AD",
    question:
      "Your company's Active Directory forest includes thousands of user accounts. All network resources will be migrated to Azure, and the on-premises data center will be retired. You need a strategy that reduces the effect on users after migration.\n\nSolution: You plan to require Azure Multi-Factor Authentication (MFA).\n\nDoes the solution meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Requiring MFA would INCREASE the effect on users, not reduce it — users would now need a second factor they previously didn't. The strategy that reduces disruption is syncing on-premises Active Directory accounts to Azure AD (via Azure AD Connect), so users can use their existing credentials. MFA is a security improvement but contradicts the goal of minimizing user impact. Community consensus: 97% agree.",
    confidence: "high",
  },
  {
    id: 34,
    type: "hotspot",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — For each statement about Platform as a Service (PaaS), select Yes if the statement is true. Otherwise select No.",
    statements: [
      {
        text: "A PaaS solution in Azure provides full control of the operating systems that host applications.",
        answer: "No",
      },
      {
        text: "A PaaS solution in Azure provides the ability to scale the platform automatically.",
        answer: "Yes",
      },
      {
        text: "A PaaS solution in Azure provides professional development services to continuously add features to custom applications.",
        answer: "Yes",
      },
    ],
    explanation:
      "PaaS does NOT give you OS control — that's IaaS. PaaS (e.g., Azure App Service) DOES provide automatic scaling and developer tools/frameworks for building applications. The cloud provider manages the OS, runtime, and middleware.",
    confidence: "high",
  },
  {
    id: 35,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each statement about Azure, select Yes if the statement is true. Otherwise select No.",
    statements: [
      {
        text: "Azure provides flexibility between capital expenditure (CapEx) and operational expenditure (OpEx).",
        answer: "Yes",
      },
      {
        text: "If you create two Azure virtual machines that use the B2S size, each virtual machine will always generate the same monthly costs.",
        answer: "No",
      },
      {
        text: "When an Azure virtual machine is stopped, you continue to pay storage costs associated to the virtual machine.",
        answer: "Yes",
      },
    ],
    explanation:
      "Yes — Azure supports both CapEx (Reserved Instances) and OpEx (pay-as-you-go). No — two identical-size VMs can have different costs based on region, OS license (Windows vs Linux), runtime hours, and additional storage. Yes — even when a VM is stopped (deallocated), you still pay for the managed disk storage attached to it.",
    confidence: "high",
  },
  {
    id: 36,
    type: "dropdown",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — When implementing a Software as a Service (SaaS) solution, you are responsible for:",
    segments: [
      {
        blank: "BLANK1",
        options: [
          "configuring high availability",
          "defining scalability rules",
          "installing the SaaS solution",
          "configuring the SaaS solution",
        ],
        answer: "configuring the SaaS solution",
      },
    ],
    explanation:
      "In SaaS, the cloud provider manages everything: infrastructure, platform, application, high availability, scalability, and installation. The customer is only responsible for configuring the solution (settings, users, data) and using it. You never install SaaS — it's accessed via browser or client.",
    confidence: "high",
  },
  {
    id: 37,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "You have an on-premises network that contains several servers. You plan to migrate all the servers to Azure. You need to recommend a solution to ensure that some of the servers are available if a single Azure data center goes offline for an extended period.\n\nWhat should you include in the recommendation?",
    options: [
      "A. fault tolerance",
      "B. elasticity",
      "C. scalability",
      "D. low latency",
    ],
    answer: "A",
    answerText: "A. fault tolerance",
    explanation:
      "Fault tolerance is the ability of a system to continue operating when one or more components fail — such as a datacenter going offline. In Azure, this is achieved through Availability Zones and region pairs. Elasticity = dynamic scaling. Scalability = handling increased load. Low latency = proximity/speed. Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 38,
    type: "dropdown",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — Complete the following statement: An organization that hosts its infrastructure",
    segments: [
      {
        blank: "BLANK1",
        options: ["in a private cloud", "in a hybrid cloud", "in the public cloud"],
        answer: "in the public cloud",
      },
      { text: " no longer requires a data center." },
    ],
    explanation:
      "When hosting in the public cloud (like Azure), you do not own or operate any physical data center hardware — Microsoft provides and manages all the infrastructure. Private cloud still requires your own on-premises data center. Hybrid cloud uses a combination of both, so you still need some on-premises infrastructure.",
    confidence: "high",
  },
  {
    id: 39,
    type: "multi",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "What are two characteristics of the public cloud? Each correct answer presents a complete solution.\n\nNOTE: Each correct selection is worth one point.",
    options: [
      "A. dedicated hardware",
      "B. unsecured connections",
      "C. limited storage",
      "D. metered pricing",
      "E. self-service management",
    ],
    answer: ["D", "E"],
    answerCount: 2,
    answerText: "D and E",
    explanation:
      "Public cloud characteristics: D (metered pricing) — you pay for what you use, no upfront hardware cost. E (self-service management) — users provision resources on demand without human intervention from the provider. NOT A (dedicated hardware — public cloud uses shared, multi-tenant hardware). NOT B (connections ARE secured via TLS/encryption). NOT C (public cloud offers virtually unlimited storage). Community consensus: 100% agree.",
    confidence: "high",
  },
  {
    id: 40,
    type: "dropdown",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — When planning to migrate a public website to Azure, you must plan to",
    segments: [
      {
        blank: "BLANK1",
        options: [
          "deploy a VPN",
          "pay monthly usage costs",
          "pay to transfer all the website data to Azure",
          "reduce the number of connections to the website",
        ],
        answer: "pay monthly usage costs",
      },
      { text: "." },
    ],
    explanation:
      "Azure uses a consumption-based (pay-as-you-go) model, so you pay monthly usage costs for compute, storage, bandwidth, etc. You do NOT need a VPN for a public website. Data ingress (transfer INTO Azure) is free. You don't need to reduce connections — Azure scales to handle traffic.",
    confidence: "high",
  },
  // ── Q41 ──────────────────────────────────────────────────────────────────
  {
    id: 41,
    type: "yesno",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to migrate all its data and resources to Azure.\nThe company's migration plan states that only PaaS solutions must be used in Azure.\nYou need to deploy an app to Azure that will use an Azure App Service plan and Azure SQL databases.\nSolution: The solution uses only PaaS.\nDoes this meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "A",
    answerText: "A. Yes",
    explanation:
      "Azure App Service (web hosting) and Azure SQL Database are both PaaS services — the underlying OS and infrastructure are fully managed by Microsoft. No VMs or IaaS components are required. ✅ This is a valid PaaS-only deployment.",
    confidence: "high",
  },
  // ── Q42 ──────────────────────────────────────────────────────────────────
  {
    id: 42,
    type: "yesno",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to migrate all its data and resources to Azure.\nThe company's migration plan states that only PaaS solutions must be used in Azure.\nYou need to deploy an app that runs on Azure virtual machines (VMs) that have SQL Server installed.\nSolution: The solution uses only PaaS.\nDoes this meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Azure Virtual Machines are IaaS, not PaaS. You manage the OS, patches, and SQL Server installation. The requirement is PaaS-only, so VMs with SQL Server violate the plan. The correct PaaS alternative would be Azure SQL Database.",
    confidence: "high",
  },
  // ── Q43 ──────────────────────────────────────────────────────────────────
  {
    id: 43,
    type: "yesno",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to migrate all its data and resources to Azure.\nThe company's migration plan states that only PaaS solutions must be used in Azure.\nYou need to deploy an app to Azure that will use Azure App Service and Azure Storage accounts.\nSolution: The solution uses only PaaS.\nDoes this meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "⚠️ DEBATED (53% No / 47% Yes). ExamTopics marks this B (No). The reasoning: Azure Storage accounts are technically classified as IaaS in the shared-responsibility model because the customer manages the data and access keys. Azure App Service is PaaS, but Azure Storage spans both models. For the AZ-900 exam, Azure Storage is often considered IaaS. However, many practitioners treat Storage as PaaS. If this appears on your exam, B (No) is the official answer.",
    confidence: "medium",
  },
  // ── Q44 ──────────────────────────────────────────────────────────────────
  {
    id: 44,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "A company has an app that runs on Azure virtual machines. The app experiences very low usage for 3 weeks of each month and very high usage for 1 week each month. Which cloud benefit would most help reduce costs during the low-usage periods?",
    options: [
      "A. high availability",
      "B. disaster recovery",
      "C. elasticity",
      "D. load balancing",
    ],
    answer: "C",
    answerText: "C. elasticity",
    explanation:
      "Elasticity is the ability to dynamically scale resources up or down to match demand. During the 3 low-usage weeks, elasticity allows you to scale DOWN and pay less. During the high-usage week, you scale up. This directly reduces costs during low periods.",
    confidence: "high",
  },
  // ── Q45 ──────────────────────────────────────────────────────────────────
  {
    id: 45,
    type: "single",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "A company wants to migrate a web application to Azure. The migration must minimize the administrative effort required to manage the application. What type of cloud service should the company use?",
    options: [
      "A. Infrastructure as a Service (IaaS)",
      "B. Platform as a Service (PaaS)",
      "C. Software as a Service (SaaS)",
      "D. Function as a Service (FaaS)",
    ],
    answer: "B",
    answerText: "B. Platform as a Service (PaaS)",
    explanation:
      "PaaS (e.g., Azure App Service) handles OS, runtime, and infrastructure management automatically, minimizing administrative effort. IaaS requires managing the OS and middleware. SaaS is for end-user applications, not custom web apps. PaaS hits the sweet spot for web application hosting with minimal admin overhead.",
    confidence: "high",
  },
  // ── Q46 ──────────────────────────────────────────────────────────────────
  {
    id: 46,
    type: "hotspot",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — For each of the following Azure services, select the cloud service model that represents the service.",
    statements: [
      { text: "Azure virtual machines", answer: "IaaS" },
      { text: "Azure SQL Database", answer: "PaaS" },
    ],
    explanation:
      "Azure Virtual Machines = IaaS (you manage the OS, patches, middleware). Azure SQL Database = PaaS (Microsoft manages the database engine, OS, and hardware — you only manage data and queries).",
    confidence: "high",
  },
  // ── Q47 ──────────────────────────────────────────────────────────────────
  {
    id: 47,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "You have an on-premises network that contains 100 servers. You need to recommend a solution that provides additional resources to your users. The solution must minimize capital and operational expenditure costs. What should you include in the recommendation?",
    options: [
      "A. a complete migration to the public cloud",
      "B. an additional data center",
      "C. a private cloud",
      "D. a hybrid cloud",
    ],
    answer: "D",
    answerText: "D. a hybrid cloud",
    explanation:
      "A hybrid cloud lets you keep existing on-premises infrastructure (avoiding full migration CapEx) while adding public cloud resources on-demand (minimizing OpEx). A complete migration to public cloud would have high migration costs. An additional data center increases CapEx. A private cloud doesn't reduce OpEx. Hybrid is the optimal balance.",
    confidence: "high",
  },
  // ── Q48 ──────────────────────────────────────────────────────────────────
  {
    id: 48,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each of the following statements about cloud models, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "To achieve a hybrid cloud model, a company must always migrate from a private cloud model.", answer: "No" },
      { text: "A company can extend the capacity of its internal network by using the public cloud.", answer: "Yes" },
      { text: "In a public cloud model, only guest users at your company can access the resources in the cloud.", answer: "No" },
    ],
    explanation:
      "Statement 1: No — hybrid cloud can be built from scratch without migrating from a private cloud. Statement 2: Yes — this is the core value proposition of hybrid cloud (burst to public cloud). Statement 3: No — in a public cloud, authenticated users (not just guests) can access resources; access is controlled by IAM policies, not user type.",
    confidence: "high",
  },
  // ── Q49 ──────────────────────────────────────────────────────────────────
  {
    id: 49,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "You plan to migrate several servers from an on-premises network to Azure. What is an advantage of using a public cloud service for the servers over an on-premises network?",
    options: [
      "A. The public cloud is owned by the public, NOT a private corporation",
      "B. The public cloud is a crowd-sourcing solution that provides corporations with the ability to enhance the cloud",
      "C. All public cloud resources can be freely accessed by every member of the public",
      "D. The public cloud is a shared entity whereby multiple corporations each use a portion of the resources in the cloud",
    ],
    answer: "D",
    answerText: "D. The public cloud is a shared entity whereby multiple corporations each use a portion of the resources in the cloud",
    explanation:
      "Public cloud is a multi-tenant shared infrastructure — multiple organizations share the physical hardware, reducing costs through economies of scale. A is incorrect (owned by cloud providers like Microsoft, not 'the public'). B is incorrect (not crowd-sourcing). C is incorrect (resources are not freely accessible — they require authentication and payment).",
    confidence: "high",
  },
  // ── Q50 ──────────────────────────────────────────────────────────────────
  {
    id: 50,
    type: "dropdown",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — To complete the sentence, select the appropriate option.",
    segments: [
      { text: "Azure Site Recovery provides " },
      {
        blank: "BLANK1",
        options: ["fault tolerance", "disaster recovery", "elasticity", "high availability"],
        answer: "disaster recovery",
      },
      { text: " for virtual machines." },
    ],
    explanation:
      "Azure Site Recovery (ASR) is a Disaster Recovery as a Service (DRaaS) solution — it replicates VMs to a secondary region and enables failover when the primary region goes down. It is not fault tolerance (which prevents downtime entirely) nor high availability (which is about uptime SLAs). Disaster recovery is specifically about recovery AFTER a failure.",
    confidence: "high",
  },
  // ── Q51 ──────────────────────────────────────────────────────────────────
  {
    id: 51,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "In which type of cloud model are all the hardware resources owned by a third-party and shared between multiple tenants?",
    options: ["A. private", "B. hybrid", "C. public"],
    answer: "C",
    answerText: "C. public",
    explanation:
      "In a public cloud, the hardware is owned and operated by a third-party cloud provider (e.g., Microsoft Azure) and shared among multiple tenants/customers. Private cloud = dedicated hardware owned/managed by a single organization. Hybrid = combination of both.",
    confidence: "high",
  },
  // ── Q53 ──────────────────────────────────────────────────────────────────
  {
    id: 53,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "You have 1,000 virtual machines hosted on Hyper-V hosts in a data center. You plan to migrate all the virtual machines to an Azure pay-as-you-go subscription. You need to identify which expenditure model to use for the planned Azure solution. Which expenditure model should you identify?",
    options: ["A. operational", "B. elastic", "C. capital", "D. scalable"],
    answer: "A",
    answerText: "A. operational",
    explanation:
      "Azure's pay-as-you-go model is an Operational Expenditure (OpEx) model — you pay for what you consume monthly, like a utility bill. Capital Expenditure (CapEx) is for on-premises hardware purchases. 'Elastic' and 'scalable' are cloud characteristics, not expenditure models.",
    confidence: "high",
  },
  // ── Q54 ──────────────────────────────────────────────────────────────────
  {
    id: 54,
    type: "matching",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "DRAG DROP — Match each cloud service benefit to its description. Each answer option may be used once, more than once, or not at all.",
    pairs: [
      { left: "A cloud service that remains available after a failure occurs", right: "Fault tolerance" },
      { left: "A cloud service that can be recovered after a failure occurs", right: "Disaster recovery" },
      { left: "A cloud service that performs quickly when demand increases", right: "Dynamic scalability" },
      { left: "A cloud service that can be accessed quickly from the internet", right: "Low latency" },
    ],
    explanation:
      "Fault tolerance = system stays available despite failures (no downtime). Disaster recovery = system can be restored AFTER a failure. Dynamic scalability = performance scales up as demand increases. Low latency = fast response time for internet access.",
    confidence: "high",
  },
  // ── Q55 ──────────────────────────────────────────────────────────────────
  {
    id: 55,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each of the following statements, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "To implement a hybrid cloud model, a company must have an internal network.", answer: "No" },
      { text: "A company can extend the computing resources of its internal network by using a hybrid cloud.", answer: "Yes" },
      { text: "In a public cloud model, only guest users at your company can access the resources in the cloud.", answer: "No" },
    ],
    explanation:
      "Statement 1: No — hybrid cloud connects on-premises with public cloud, but doesn't strictly require a traditional internal network. You could use a hosted private cloud. Statement 2: Yes — a key benefit of hybrid cloud is bursting workloads to the public cloud when on-premises resources are insufficient. Statement 3: No — public cloud access is controlled by identity/authentication, not limited to 'guest users.'",
    confidence: "high",
  },
  // ── Q56 ──────────────────────────────────────────────────────────────────
  {
    id: 56,
    type: "hotspot",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — For each of the following statements about PaaS, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "A Platform as a Service (PaaS) solution provides full control of operating systems that host applications.", answer: "No" },
      { text: "A Platform as a Service (PaaS) solution provides additional memory to apps by changing pricing tiers.", answer: "Yes" },
      { text: "A Platform as a Service (PaaS) solution can automatically scale the number of instances.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — PaaS abstracts the OS; you do NOT have full control over the operating system. That's an IaaS characteristic. Statement 2: Yes — Azure App Service (PaaS) allows scaling up to higher pricing tiers to get more memory/CPU. Statement 3: Yes — PaaS supports auto-scaling (e.g., Azure App Service auto-scale rules).",
    confidence: "high",
  },
  // ── Q57 ──────────────────────────────────────────────────────────────────
  {
    id: 57,
    type: "multi",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company has an on-premises network that contains multiple servers. The company plans to reduce the following administrative responsibilities:\n• Backing up application data\n• Replacing failed server hardware\n• Managing physical server security\n• Updating server operating systems\n• Managing permissions to shared documents\n\nThe company plans to migrate servers to Azure virtual machines. You need to identify which administrative responsibilities will be eliminated after the planned migration. Which two responsibilities should you identify? Each correct answer presents a complete solution.",
    options: [
      "A. Replacing failed server hardware",
      "B. Backing up application data",
      "C. Managing physical server security",
      "D. Updating server operating systems",
      "E. Managing permissions to shared documents",
    ],
    answer: ["A", "C"],
    answerCount: 2,
    answerText: "A and C",
    explanation:
      "When migrating to Azure VMs (IaaS), Microsoft handles the physical layer: A) Replacing failed server hardware — Microsoft replaces physical hardware in their datacenters. C) Managing physical server security — Microsoft manages physical security of datacenters. You still manage: B) Backup (your responsibility in IaaS), D) OS updates (IaaS = you patch the OS), E) Permissions (always your responsibility).",
    confidence: "high",
  },
  // ── Q58 ──────────────────────────────────────────────────────────────────
  {
    id: 58,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each of the following statements about CapEx and OpEx, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Pay-As-You-Go pricing is an example of CapEx.", answer: "No" },
      { text: "Paying electricity for your datacenter is an example of OpEx.", answer: "Yes" },
      { text: "Deploying your own datacenter is an example of CapEx.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — Pay-As-You-Go is OpEx (ongoing operating expense, no upfront cost). Statement 2: Yes — electricity bills are ongoing operational costs = OpEx. Statement 3: Yes — building/deploying a datacenter requires large upfront capital investment = CapEx.",
    confidence: "high",
  },
  // ── Q59 ──────────────────────────────────────────────────────────────────
  {
    id: 59,
    type: "single",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "You plan to provision Infrastructure as a Service (IaaS) resources in Azure. Which resource is an example of IaaS?",
    options: [
      "A. an Azure web app",
      "B. an Azure virtual machine",
      "C. an Azure logic app",
      "D. an Azure SQL database",
    ],
    answer: "B",
    answerText: "B. an Azure virtual machine",
    explanation:
      "Azure Virtual Machines = IaaS (you manage OS, middleware, runtime, applications). Azure Web App = PaaS. Azure Logic App = PaaS (serverless integration). Azure SQL Database = PaaS (managed database service).",
    confidence: "high",
  },
  // ── Q60 ──────────────────────────────────────────────────────────────────
  {
    id: 60,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "To which cloud models can you deploy physical servers?",
    options: [
      "A. private cloud and hybrid cloud only",
      "B. private cloud only",
      "C. private cloud, hybrid cloud and public cloud",
      "D. hybrid cloud only",
    ],
    answer: "A",
    answerText: "A. private cloud and hybrid cloud only",
    explanation:
      "Physical servers can only be deployed in private or hybrid cloud environments (on-premises or in a co-location facility under your control). In a public cloud, you consume virtualized resources from the provider's hardware — you never deploy physical servers. Hybrid cloud includes private components where physical servers can exist.",
    confidence: "high",
  },
  // ── Q61 ──────────────────────────────────────────────────────────────────
  {
    id: 61,
    type: "matching",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "DRAG DROP — Match the cloud model to the correct advantage. Each cloud model may be used once, more than once, or not at all.",
    pairs: [
      { left: "No required capital expenditure.", right: "Public Cloud" },
      { left: "Provides complete control over security.", right: "Private Cloud" },
      { left: "Provides a choice to use on-premises or cloud-based resources.", right: "Hybrid Cloud" },
    ],
    explanation:
      "Public Cloud: No CapEx — you pay only for what you use (OpEx). Private Cloud: Complete security control — you own and manage the infrastructure. Hybrid Cloud: Choice between on-premises and cloud resources — the defining characteristic of hybrid.",
    confidence: "high",
  },
  // ── Q62 ──────────────────────────────────────────────────────────────────
  {
    id: 62,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each of the following statements about cloud models, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "A company can extend a private cloud by adding its own physical servers to the public cloud.", answer: "No" },
      { text: "To build a hybrid cloud, you must deploy resources to the public cloud.", answer: "No" },
      { text: "A private cloud must be disconnected from the internet.", answer: "No" },
    ],
    explanation:
      "Statement 1: No — you cannot add your own physical servers to a public cloud; public cloud uses the provider's hardware. Statement 2: No — hybrid cloud connects on-premises (private) with public cloud, but the public component uses the provider's infrastructure, not your own deployed resources. Statement 3: No — a private cloud can be connected to the internet; 'private' refers to dedicated infrastructure, not air-gapped isolation.",
    confidence: "high",
  },
  // ── Q63 ──────────────────────────────────────────────────────────────────
  {
    id: 63,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "You have 50 virtual machines hosted on-premises and 50 virtual machines hosted in Azure. The on-premises virtual machines and the Azure virtual machines connect to each other. Which type of cloud model is this?",
    options: ["A. hybrid", "B. private", "C. public"],
    answer: "A",
    answerText: "A. hybrid",
    explanation:
      "Hybrid cloud combines on-premises (private) infrastructure with public cloud resources (Azure VMs), connected together. This is the textbook definition of hybrid cloud.",
    confidence: "high",
  },
  // ── Q64 ──────────────────────────────────────────────────────────────────
  {
    id: 64,
    type: "hotspot",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — For each of the following statements about PaaS (Azure Web Apps), select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "A PaaS solution that hosts web apps in Azure provides full control of the operating systems that host applications.", answer: "No" },
      { text: "A PaaS solution that hosts web apps in Azure can be provided with additional memory by changing the pricing tier.", answer: "Yes" },
      { text: "A PaaS solution that hosts web apps in Azure can be configured to automatically scale the number of instances based on demand.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — Azure App Service (PaaS) abstracts the OS; Microsoft manages it. Statement 2: Yes — you can scale up to a higher App Service pricing tier to get more memory/CPU. Statement 3: Yes — Azure App Service supports auto-scale rules based on CPU, memory, or request count.",
    confidence: "high",
  },
  // ── Q65 ──────────────────────────────────────────────────────────────────
  {
    id: 65,
    type: "yesno",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to migrate all its data and resources to Azure. The company's migration plan states that only PaaS solutions must be used in Azure.\nSolution: You create Azure virtual machines, Azure SQL databases, and Azure Storage accounts.\nDoes this meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Azure Virtual Machines = IaaS, which violates the PaaS-only requirement. ⚠️ Note: 27% of community votes Yes (possibly because Azure SQL DB and Storage are PaaS/managed). However, since Azure VMs are clearly IaaS, the solution does NOT meet a PaaS-only goal. Official answer: B (No).",
    confidence: "high",
  },
  // ── Q66 ──────────────────────────────────────────────────────────────────
  {
    id: 66,
    type: "single",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to deploy several custom applications to Azure. The applications will provide invoicing services to the customers of the company. Each application will have several prerequisite applications and services installed. You need to recommend a cloud deployment solution for all the applications. What should you recommend?",
    options: [
      "A. Software as a Service (SaaS)",
      "B. Platform as a Service (PaaS)",
      "C. Infrastructure as a Service (IaaS)",
    ],
    answer: "C",
    answerText: "C. Infrastructure as a Service (IaaS)",
    explanation:
      "⚠️ DEBATED (69% IaaS / 31% PaaS). The key phrase is 'several prerequisite applications and services installed' — this implies you need to control the OS and install software, which points to IaaS. If you need to install prerequisites manually, you need VM-level control. PaaS would be appropriate if the platform handles dependencies. IaaS is the official answer.",
    confidence: "medium",
  },
  // ── Q67 ──────────────────────────────────────────────────────────────────
  {
    id: 67,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each of the following statements about CapEx and OpEx, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Building a data center infrastructure is an example of operational expenditure (OpEx) costs.", answer: "No" },
      { text: "Monthly salaries for technical personnel are an example of operational expenditure (OpEx) costs.", answer: "Yes" },
      { text: "Leasing software is an example of operational expenditure (OpEx) costs.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — building a datacenter requires large upfront capital investment = CapEx. Statement 2: Yes — monthly salaries are ongoing operational costs = OpEx. Statement 3: Yes — leasing (subscription/rental) is an ongoing expense = OpEx. Purchasing software outright = CapEx.",
    confidence: "high",
  },
  // ── Q68 ──────────────────────────────────────────────────────────────────
  {
    id: 68,
    type: "dropdown",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question: "HOTSPOT — To complete the sentence, select the appropriate option.",
    segments: [
      { text: "Azure Cosmos DB is an example of a " },
      {
        blank: "BLANK1",
        options: ["platform as a service (PaaS)", "infrastructure as a service (IaaS)", "serverless", "software as a service (SaaS)"],
        answer: "platform as a service (PaaS)",
      },
      { text: " offering." },
    ],
    explanation:
      "Azure Cosmos DB is a fully managed NoSQL database service (PaaS). Microsoft handles the infrastructure, OS, and database engine. You only manage data and configuration. It is NOT IaaS (no OS access), not SaaS (it's a developer platform), and not serverless (though it can use serverless pricing, its primary classification is PaaS).",
    confidence: "high",
  },
  // ── Q69 ──────────────────────────────────────────────────────────────────
  {
    id: 69,
    type: "hotspot",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — For each of the following statements, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "With software as a service (SaaS), you must apply software updates.", answer: "No" },
      { text: "With infrastructure as a service (IaaS), you must install the software that you want to use.", answer: "Yes" },
      { text: "Azure Backup is an example of platform as a service (PaaS).", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — with SaaS, the provider applies software updates; the customer just uses the application. Statement 2: Yes — with IaaS, you manage the OS and must install any software/middleware you need. Statement 3: Yes — Azure Backup is a managed backup service where Microsoft handles the infrastructure = PaaS.",
    confidence: "high",
  },
  // ── Q70 ──────────────────────────────────────────────────────────────────
  {
    id: 70,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "HOTSPOT — For each of the following statements about Azure resource groups, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You can create a resource group inside of another resource group.", answer: "No" },
      { text: "An Azure virtual machine can be in multiple resource groups.", answer: "No" },
      { text: "A resource group can contain resources from multiple Azure regions.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — resource groups cannot be nested; each resource group exists at the subscription level. Statement 2: No — each Azure resource belongs to exactly one resource group at a time. Statement 3: Yes — a resource group is a logical container that can hold resources from any Azure region.",
    confidence: "high",
  },
  // ── Q71 ──────────────────────────────────────────────────────────────────
  {
    id: 71,
    type: "hotspot",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — For each of the following statements, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Microsoft SQL Server 2019 installed on an Azure virtual machine is an example of platform as a service (PaaS).", answer: "No" },
      { text: "Azure SQL Database is an example of platform as a service (PaaS).", answer: "Yes" },
      { text: "Azure Cosmos DB is an example of software as a service (SaaS).", answer: "No" },
    ],
    explanation:
      "Statement 1: No — SQL Server on a VM = IaaS (you manage the VM, OS, and SQL Server installation). Statement 2: Yes — Azure SQL Database is a fully managed PaaS database service. Statement 3: No — Azure Cosmos DB is PaaS (managed database), not SaaS (which is end-user software like Office 365).",
    confidence: "high",
  },
  // ── Q73 ──────────────────────────────────────────────────────────────────
  {
    id: 73,
    type: "single",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "Your company plans to migrate all its data and resources to Azure. The company's migration plan states that only PaaS solutions must be used in Azure. You need to deploy an Azure environment that meets the company's migration plan. What should you create?",
    options: [
      "A. Azure virtual machines, Azure SQL databases, and Azure Storage accounts.",
      "B. an Azure App Service and Azure virtual machines that have Microsoft SQL Server installed.",
      "C. an Azure App Service and Azure SQL databases.",
      "D. Azure storage accounts and web server in Azure virtual machines.",
    ],
    answer: "C",
    answerText: "C. an Azure App Service and Azure SQL databases.",
    explanation:
      "Azure App Service = PaaS (managed web hosting). Azure SQL Database = PaaS (managed database). Both are fully PaaS — Microsoft manages the underlying infrastructure. Options A and D include Azure VMs (IaaS). Option B includes VMs with SQL Server (IaaS).",
    confidence: "high",
  },
  // ── Q74 ──────────────────────────────────────────────────────────────────
  {
    id: 74,
    type: "single",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "What does a customer provide in a software as a service (SaaS) model?",
    options: [
      "A. application data",
      "B. data storage",
      "C. compute resources",
      "D. application software",
    ],
    answer: "A",
    answerText: "A. application data",
    explanation:
      "In SaaS, the provider manages everything (infrastructure, OS, runtime, application software). The customer only provides the application data (content they create/enter into the software). Data storage, compute resources, and the application software are all managed by the provider.",
    confidence: "high",
  },
  // ── Q75 ──────────────────────────────────────────────────────────────────
  {
    id: 75,
    type: "hotspot",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — For each of the following statements, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Files is an example of infrastructure as a service (IaaS).", answer: "No" },
      { text: "A DNS server that runs on an Azure virtual machine is an example of platform as a service (PaaS).", answer: "No" },
      { text: "Microsoft Intune is an example of software as a service (SaaS).", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — Azure Files is a fully managed file share service = PaaS, not IaaS. Statement 2: No — a DNS server on an Azure VM = IaaS (you install and manage the DNS software on the VM). Statement 3: Yes — Microsoft Intune is a cloud-based MDM/MAM solution delivered as a subscription service = SaaS.",
    confidence: "high",
  },
  // ── Q76 ──────────────────────────────────────────────────────────────────
  {
    id: 76,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each of the following statements about cloud computing, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Cloud computing provides elastic scalability.", answer: "Yes" },
      { text: "Customers can minimize capital expenditure (CapEx) by using a public cloud.", answer: "Yes" },
      { text: "Cloud computing leverages virtualization to provide services to multiple customers simultaneously.", answer: "Yes" },
    ],
    explanation:
      "All three are Yes: Elastic scalability = fundamental cloud benefit (scale up/down on demand). Minimize CapEx = public cloud shifts spend to OpEx (pay-as-you-go). Virtualization = the core technology enabling cloud's multi-tenant, shared infrastructure model.",
    confidence: "high",
  },
  // ── Q77 ──────────────────────────────────────────────────────────────────
  {
    id: 77,
    type: "single",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question:
      "What is the first stage in the Microsoft Cloud Adoption Framework for Azure?",
    options: [
      "A. Adopt the cloud.",
      "B. Make a plan.",
      "C. Ready your organization.",
      "D. Define your strategy.",
    ],
    answer: "D",
    answerText: "D. Define your strategy.",
    explanation:
      "The Microsoft Cloud Adoption Framework (CAF) stages in order are: 1) Define your strategy → 2) Make a plan → 3) Ready your organization → 4) Adopt the cloud (migrate/innovate) → 5) Govern → 6) Manage. 'Define your strategy' is always the first step.",
    confidence: "high",
  },
  // ── Q78 ──────────────────────────────────────────────────────────────────
  {
    id: 78,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each of the following statements about cloud computing, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "A company can extend an internal network by adding its own physical servers to the public cloud.", answer: "No" },
      { text: "A private cloud must be disconnected from the internet.", answer: "No" },
      { text: "Part of a hybrid cloud is the public cloud.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — you cannot add your own physical servers to public cloud; it uses the provider's hardware (you consume virtual resources). Statement 2: No — private cloud can be connected to the internet; 'private' means dedicated to one organization, not disconnected. Statement 3: Yes — hybrid cloud = combination of private + public cloud.",
    confidence: "high",
  },
  // ── Q79 ──────────────────────────────────────────────────────────────────
  {
    id: 79,
    type: "hotspot",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "HOTSPOT — For each of the following statements about cloud computing, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You must have physical servers to use cloud computing.", answer: "No" },
      { text: "You must have internet connectivity to use cloud computing.", answer: "Yes" },
      { text: "The costs to increase cloud computing capacity are less than the costs to increase the computing capacity of an on-premises datacenter.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — cloud computing eliminates the need for physical servers; you use the provider's hardware. Statement 2: Yes — internet connectivity is required to access cloud resources (ExpressRoute uses dedicated private lines, but some form of connectivity is always required). Statement 3: Yes — scaling in the cloud is cheaper (no hardware procurement, just scale up/down on-demand).",
    confidence: "high",
  },
  // ── Q80 ──────────────────────────────────────────────────────────────────
  {
    id: 80,
    type: "matching",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "DRAG DROP — Match each cloud computing benefit to its correct description. Each benefit may be used once, more than once, or not at all.",
    pairs: [
      { left: "Resources can be provisioned dynamically to meet changing demands.", right: "Scalability" },
      { left: "Applications and data can be deployed to multiple regions.", right: "Geo-distribution" },
      { left: "Applications can be developed, tested, and launched rapidly.", right: "Agility" },
    ],
    explanation:
      "Scalability = dynamically provision/deprovision resources to match demand. Geo-distribution = deploy to multiple geographic regions for performance and redundancy. Agility = rapid development, testing, and deployment of applications — one of cloud's key competitive advantages.",
    confidence: "high",
  },
  // ── Q81 ──────────────────────────────────────────────────────────────────
  {
    id: 81,
    type: "dropdown",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Azure Site Recovery provides " },
      {
        blank: "BLANK1",
        options: ["fault tolerance", "disaster recovery", "elasticity", "high availability"],
        answer: "disaster recovery",
      },
      { text: " for virtual machines." },
    ],
    explanation:
      "Azure Site Recovery (ASR) is a Disaster Recovery as a Service (DRaaS) tool that replicates VMs to a secondary Azure region and enables failover. It is specifically for disaster recovery — restoring services AFTER a failure, not preventing failures (fault tolerance) or providing always-on uptime (high availability).",
    confidence: "high",
  },
  // ── Q82 ──────────────────────────────────────────────────────────────────
  {
    id: 82,
    type: "dropdown",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "HOTSPOT — You plan to use Azure to host two apps named App1 and App2. App1 requires: modifiable code and minimized OS admin effort. App2 requires: interactive access to the OS. Select the cloud service type for each app.",
    segments: [
      { text: "App1: " },
      {
        blank: "BLANK1",
        options: ["Infrastructure as a service (IaaS)", "Platform as a service (PaaS)", "Software as a service (SaaS)"],
        answer: "Platform as a service (PaaS)",
      },
      { text: " | App2: " },
      {
        blank: "BLANK2",
        options: ["Infrastructure as a service (IaaS)", "Platform as a service (PaaS)", "Software as a service (SaaS)"],
        answer: "Infrastructure as a service (IaaS)",
      },
    ],
    explanation:
      "App1: Needs code modification (custom app) + minimized OS admin = PaaS (e.g., Azure App Service manages the OS). App2: Needs to interact directly with the OS = IaaS (e.g., Azure VM where you have full OS access).",
    confidence: "high",
  },
  // ── Q83 ──────────────────────────────────────────────────────────────────
  {
    id: 83,
    type: "single",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question:
      "You have an accounting application named App1 that uses a legacy database. You plan to move App1 to the cloud. Which service model should you use?",
    options: [
      "A. platform as a service (PaaS)",
      "B. infrastructure as a service (IaaS)",
      "C. software as a service (SaaS)",
    ],
    answer: "B",
    answerText: "B. infrastructure as a service (IaaS)",
    explanation:
      "A legacy database requires specific OS and software configurations that a managed PaaS environment may not support. IaaS (Azure VMs) gives you full control over the OS and database setup, making it the correct choice for lift-and-shift migrations of legacy applications.",
    confidence: "high",
  },
  // ── Q84 ──────────────────────────────────────────────────────────────────
  {
    id: 84,
    type: "single",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question: "Microsoft 365 is an example of which cloud service model?",
    options: [
      "A. infrastructure as a service (IaaS)",
      "B. platform as a service (PaaS)",
      "C. software as a service (SaaS)",
    ],
    answer: "C",
    answerText: "C. software as a service (SaaS)",
    explanation:
      "Microsoft 365 (Word, Excel, Teams, Outlook, etc.) is a SaaS offering — fully managed software delivered over the internet on a subscription basis. Users consume the application without managing any infrastructure, OS, or runtime.",
    confidence: "high",
  },
  // ── Q85 ──────────────────────────────────────────────────────────────────
  {
    id: 85,
    type: "dropdown",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "An Azure web app that queries an on-premises Microsoft SQL server is an example of a " },
      {
        blank: "BLANK1",
        options: ["hybrid", "multi-vendor", "private", "public"],
        answer: "hybrid",
      },
      { text: " cloud." },
    ],
    explanation:
      "Hybrid cloud = combination of public cloud (Azure web app) and on-premises/private infrastructure (on-prem SQL Server). When cloud resources communicate with on-premises resources, that is the definition of a hybrid cloud model.",
    confidence: "high",
  },
  // ── Q86 ──────────────────────────────────────────────────────────────────
  {
    id: 86,
    type: "dropdown",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "A Microsoft SQL Server database that is hosted in the cloud and has software updates managed by Azure is an example of " },
      {
        blank: "BLANK1",
        options: ["disaster recovery as a service (DRaaS)", "infrastructure as a service (IaaS)", "platform as a service (PaaS)", "software as a service (SaaS)"],
        answer: "platform as a service (PaaS)",
      },
      { text: "." },
    ],
    explanation:
      "Azure SQL Database is PaaS — Microsoft manages the underlying infrastructure, OS, and SQL Server software updates. You only manage your data and database-level settings. This matches the description of 'hosted in the cloud with software updates managed by Azure.'",
    confidence: "high",
  },
  // ── Q87 ──────────────────────────────────────────────────────────────────
  {
    id: 87,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question: "Which cloud computing model includes on-premises and cloud-based resources?",
    options: ["A. hybrid", "B. public", "C. private"],
    answer: "A",
    answerText: "A. hybrid",
    explanation:
      "Hybrid cloud is defined as the combination of on-premises (private) infrastructure with public cloud resources. It allows workloads to move between on-premises and cloud environments.",
    confidence: "high",
  },
  // ── Q88 ──────────────────────────────────────────────────────────────────
  {
    id: 88,
    type: "dropdown",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Autoscaling is an example of " },
      {
        blank: "BLANK1",
        options: ["agility", "elasticity", "geo-distribution", "predictability"],
        answer: "elasticity",
      },
      { text: "." },
    ],
    explanation:
      "Autoscaling automatically increases or decreases compute resources based on demand — this is the definition of elasticity. Agility = speed of provisioning; Geo-distribution = deploying to multiple regions; Predictability = consistent performance/cost.",
    confidence: "high",
  },
  // ── Q90 ──────────────────────────────────────────────────────────────────
  {
    id: 90,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "Which term represents the ability to increase the computing capacity of a virtual machine by adding memory or CPUs?",
    options: ["A. agility", "B. vertical scaling", "C. horizontal scaling", "D. elasticity"],
    answer: "B",
    answerText: "B. vertical scaling",
    explanation:
      "Vertical scaling (scale up/down) = increasing the size of an existing resource, such as adding more CPU or RAM to a VM. Horizontal scaling (scale out/in) = adding more instances of the same VM. Elasticity = the broader ability to automatically scale. Agility = speed of provisioning.",
    confidence: "high",
  },
  // ── Q91 ──────────────────────────────────────────────────────────────────
  {
    id: 91,
    type: "multi",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "What are two benefits of cloud computing? Each correct answer presents a complete solution.",
    options: [
      "A. enables the rapid provisioning of resources",
      "B. has increased administrative complexity",
      "C. has the same configuration options as on-premises",
      "D. shifts capital expenditures (CAPEX) to operating expenditures (OPEX)",
    ],
    answer: ["A", "D"],
    answerCount: 2,
    answerText: "A and D",
    explanation:
      "A: Cloud enables rapid provisioning of resources (agility) — spin up VMs/services in minutes vs. weeks for on-premises. D: Cloud shifts spending from CapEx (upfront hardware purchases) to OpEx (pay-as-you-go). B is wrong (cloud REDUCES admin complexity). C is wrong (cloud offers MORE configuration options, not the same).",
    confidence: "high",
  },
  // ── Q92 ──────────────────────────────────────────────────────────────────
  {
    id: 92,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "What is a feature of an Azure virtual network?",
    options: [
      "A. resource cost analysis",
      "B. packet inspection",
      "C. geo-redundancy",
      "D. isolation and segmentation",
    ],
    answer: "D",
    answerText: "D. isolation and segmentation",
    explanation:
      "Azure Virtual Networks provide isolation and segmentation — you can create isolated network spaces and segment them using subnets and NSGs. Packet inspection requires Azure Firewall or NVA. Resource cost analysis is done via Azure Cost Management. Geo-redundancy is handled by availability zones/regions, not VNet itself.",
    confidence: "high",
  },
  // ── Q93 ──────────────────────────────────────────────────────────────────
  {
    id: 93,
    type: "dropdown",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      {
        blank: "BLANK1",
        options: ["Elasticity", "Geo-distribution", "High availability", "Scalability"],
        answer: "Geo-distribution",
      },
      { text: " enables Azure resources to be deployed close to users." },
    ],
    explanation:
      "Geo-distribution = deploying apps and data to regional datacenters around the globe so users always access the nearest datacenter. This reduces latency and improves performance. Elasticity = auto-scaling. High availability = uptime SLAs. Scalability = capacity management.",
    confidence: "high",
  },
  // ── Q94 ──────────────────────────────────────────────────────────────────
  {
    id: 94,
    type: "matching",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "DRAG DROP — Match each cloud computing benefit to its correct description. Each benefit may be used once, more than once, or not at all.",
    pairs: [
      { left: "Increase the compute capacity of apps in the cloud.", right: "Scalability" },
      { left: "Provide a continuous user experience with no apparent downtime.", right: "High availability" },
      { left: "Ensure that users always have the best experience by deploying apps to all the regions where there are users.", right: "Geo-distribution" },
    ],
    explanation:
      "Scalability = increasing capacity (compute, storage) as needed. High availability = continuous access with minimal/no downtime (SLA-backed uptime). Geo-distribution = deploying to multiple regions so users connect to the nearest location.",
    confidence: "high",
  },
  // ── Q95 ──────────────────────────────────────────────────────────────────
  {
    id: 95,
    type: "single",
    topic: "CloudConcepts",
    topicLabel: "Cloud Concepts & Cost Models",
    question:
      "Which cloud computing benefit provides continuous user access to a cloud-based application with minimal downtime?",
    options: ["A. agility", "B. scalability", "C. elasticity", "D. high availability"],
    answer: "D",
    answerText: "D. high availability",
    explanation:
      "High availability ensures that applications remain accessible with minimal downtime, backed by SLAs (e.g., 99.9% uptime). Agility = speed of deployment. Scalability = capacity growth. Elasticity = auto-scaling based on demand.",
    confidence: "high",
  },
  // ── Q96 ──────────────────────────────────────────────────────────────────
  {
    id: 96,
    type: "single",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "You need to identify the type of failure for which an Azure Availability Zone can be used to protect access to Azure services. What should you identify?",
    options: [
      "A. a physical server failure",
      "B. an Azure region failure",
      "C. a storage failure",
      "D. an Azure data center failure",
    ],
    answer: "D",
    answerText: "D. an Azure data center failure",
    explanation:
      "Azure Availability Zones are physically separate datacenters within a single Azure region, each with independent power, cooling, and networking. They protect against data center-level failures. They do NOT protect against an entire region failure (you need region pairs for that). A physical server failure is handled by Azure's internal redundancy within a datacenter.",
    confidence: "high",
  },
  // ── Q97 ──────────────────────────────────────────────────────────────────
  {
    id: 97,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question:
      "You plan to connect your company's network to Azure. The network contains a VPN appliance that uses an IP address of 131.107.200.1. You need to create an Azure resource that defines the VPN appliance in Azure. Which Azure resource should you create?",
    options: [
      "A. NAT gateways",
      "B. Application gateways",
      "C. Local network gateways",
      "D. Virtual network gateways",
      "E. On-premises Data Gateways",
      "F. Azure Stack Edge / Data Box Gateway",
      "G. Web Application Firewall policies",
    ],
    answer: "C",
    answerText: "C. Local network gateways",
    explanation:
      "A Local Network Gateway is the Azure object that represents your on-premises VPN device. It stores the public IP address of the VPN appliance (131.107.200.1) and the on-premises address space. A Virtual Network Gateway represents the Azure-side of the VPN connection.",
    confidence: "high",
  },
  // ── Q98 ──────────────────────────────────────────────────────────────────
  {
    id: 98,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "You plan to deploy several Azure virtual machines. You need to ensure that the services running on the virtual machines are available if a single data center fails.\nSolution: You deploy the virtual machines to two or more resource groups.\nDoes this meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "Resource groups are logical containers for managing resources — they have no impact on physical placement or availability. To protect against a data center failure, you need to deploy VMs to multiple Availability Zones (different physical datacenters within a region) or Availability Sets.",
    confidence: "high",
  },
  // ── Q99 ──────────────────────────────────────────────────────────────────
  {
    id: 99,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "You plan to deploy several Azure virtual machines. You need to ensure that the services running on the virtual machines are available if a single data center fails.\nSolution: You deploy the virtual machines to a scale set.\nDoes this meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation:
      "A Virtual Machine Scale Set (VMSS) enables automatic scaling of multiple identical VMs, but by default all VMs can be in the same datacenter. A scale set alone does not guarantee protection against a single data center failure. You need to combine VMSS with Availability Zones to achieve datacenter-failure resilience.",
    confidence: "high",
  },
  // ── Q100 ─────────────────────────────────────────────────────────────────
  {
    id: 100,
    type: "hotspot",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question:
      "HOTSPOT — For each of the following statements about Azure subscriptions and Azure Active Directory (Azure AD), select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "An Azure subscription can be associated to multiple Azure Active Directory (Azure AD) tenants.", answer: "No" },
      { text: "You can change the Azure Active Directory (Azure AD) tenant to which an Azure subscription is associated.", answer: "Yes" },
      { text: "When an Azure subscription expires, the associated Azure Active Directory (Azure AD) tenant is deleted automatically.", answer: "No" },
    ],
    explanation:
      "Statement 1: No — each Azure subscription is associated with exactly ONE Azure AD tenant at a time. Statement 2: Yes — you can change (transfer) the Azure AD directory associated with a subscription. Statement 3: No — Azure AD tenants are independent of subscriptions; the tenant persists after a subscription expires.",
    confidence: "high",
  },
  // ── Q101 ─────────────────────────────────────────────────────────────────
  {
    id: 101,
    type: "single",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question:
      "This question requires you to evaluate the underlined text to determine if it is correct.\n'Resource groups provide organizations with the ability to manage the compliance of Azure resources across multiple subscriptions.'\nIf the statement is incorrect, select the answer choice that makes it correct.",
    options: [
      "A. No change is needed",
      "B. Management groups",
      "C. Azure policies",
      "D. Azure App Service plans",
    ],
    answer: "B",
    answerText: "B. Management groups",
    explanation:
      "⚠️ DEBATED (61% Management groups / 38% Azure policies). Management groups are containers that help manage access, policy, and compliance ACROSS multiple subscriptions. Azure Policies enforce rules but don't span subscriptions by themselves without management groups. The correct replacement for 'Resource groups' is 'Management groups.'",
    confidence: "medium",
  },
  // ── Q102 ─────────────────────────────────────────────────────────────────
  {
    id: 102,
    type: "multi",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "Your company plans to migrate to Azure. The company has several departments. All the Azure resources used by each department will be managed by a department administrator. What are two possible techniques to segment Azure for the departments? Each correct answer presents a complete solution.",
    options: [
      "A. multiple subscriptions",
      "B. multiple Azure Active Directory (Azure AD) directories",
      "C. multiple regions",
      "D. multiple resource groups",
    ],
    answer: ["A", "D"],
    answerCount: 2,
    answerText: "A and D",
    explanation:
      "A: Multiple subscriptions — each department gets its own subscription with isolated billing, access control, and resource limits. D: Multiple resource groups — within a shared subscription, each department gets its own resource group with separate RBAC permissions. B: Multiple Azure AD directories adds unnecessary complexity. C: Multiple regions is for geo-distribution, not departmental segmentation.",
    confidence: "high",
  },
  // ── Q103 ─────────────────────────────────────────────────────────────────
  {
    id: 103,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "HOTSPOT — For each of the following statements about Azure subscriptions, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "A single Microsoft account can be used to manage multiple Azure subscriptions.", answer: "Yes" },
      { text: "Two Azure subscriptions can be merged into a single subscription.", answer: "No" },
      { text: "A company can use resources from multiple subscriptions.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: Yes — one account can be the owner/administrator of multiple Azure subscriptions. Statement 2: No — Azure subscriptions cannot be merged; they are separate billing and management boundaries. Statement 3: Yes — organizations can use resources across multiple subscriptions (e.g., through VNet peering or management groups).",
    confidence: "high",
  },
  // ── Q104 ─────────────────────────────────────────────────────────────────
  {
    id: 104,
    type: "dropdown",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — To complete the sentence, select the appropriate option.",
    segments: [
      { text: "You have several virtual machines in an Azure subscription. You create a new subscription. " },
      {
        blank: "BLANK1",
        options: [
          "The virtual machines cannot be moved to the new subscription.",
          "The virtual machines can be moved to the new subscription.",
          "The virtual machines can be moved to the new subscription only if they are all in the same resource group.",
          "The virtual machines can be moved to the new subscription only if they run Windows Server 2016.",
        ],
        answer: "The virtual machines can be moved to the new subscription.",
      },
    ],
    explanation:
      "Azure supports moving resources (including VMs) between subscriptions using the 'Move Resources' feature in the Azure portal or via PowerShell/CLI. There is no requirement that they be in the same resource group or run a specific OS.",
    confidence: "high",
  },
  // ── Q105 ─────────────────────────────────────────────────────────────────
  {
    id: 105,
    type: "multi",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question:
      "You have an Azure environment that contains multiple Azure virtual machines. You plan to implement a solution that enables the client computers on your on-premises network to communicate with the Azure virtual machines. Which two Azure resources should you include in the recommendation? Each correct answer presents part of the solution.",
    options: [
      "A. a virtual network gateway",
      "B. a load balancer",
      "C. an application gateway",
      "D. a virtual network",
      "E. a gateway subnet",
    ],
    answer: ["A", "D"],
    answerCount: 2,
    answerText: "A and D",
    explanation:
      "⚠️ DEBATED (51% AD / 44% AE). To connect on-premises to Azure via VPN: A) Virtual network gateway — the Azure-side VPN endpoint. D) Virtual network — the network where Azure VMs reside. Note: A gateway subnet is technically required inside the VNet, but 'virtual network' (D) is the broader resource. Official answer: A and D.",
    confidence: "medium",
  },
  // ── Q106 ─────────────────────────────────────────────────────────────────
  {
    id: 106,
    type: "single",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "You attempt to create several managed Microsoft SQL Server instances in an Azure environment and receive a message that you must increase your Azure subscription limits. What should you do to increase the limits?",
    options: [
      "A. Create a service health alert",
      "B. Upgrade your support plan",
      "C. Modify an Azure policy",
      "D. Create a new support request",
    ],
    answer: "D",
    answerText: "D. Create a new support request",
    explanation:
      "Azure subscription limits (quotas) can be increased by submitting a support request to Microsoft. You select 'Service and subscription limits (quotas)' as the request type. Upgrading a support plan changes response times but doesn't increase quotas. Policies and health alerts don't change limits.",
    confidence: "high",
  },
  // ── Q107 ─────────────────────────────────────────────────────────────────
  {
    id: 107,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "HOTSPOT — For each of the following statements about Azure subscriptions and accounts, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Each Azure subscription can contain multiple account administrators.", answer: "Yes" },
      { text: "Each Azure subscription can be managed by using a Microsoft account only.", answer: "No" },
      { text: "An Azure resource group contains multiple Azure subscriptions.", answer: "No" },
    ],
    explanation:
      "Statement 1: Yes — multiple users can be assigned Owner/Contributor roles (admins) to a subscription. Statement 2: No — subscriptions can be managed by Microsoft accounts, Azure AD work/school accounts, or service principals. Statement 3: No — the hierarchy is: Management Groups > Subscriptions > Resource Groups > Resources.",
    confidence: "high",
  },
  // ── Q108 ─────────────────────────────────────────────────────────────────
  {
    id: 108,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "HOTSPOT — For each of the following statements about Azure Availability Zones, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Availability zones can be implemented in all Azure regions.", answer: "No" },
      { text: "Only virtual machines that run Windows Server can be created in availability zones.", answer: "No" },
      { text: "Availability zones are used to replicate data and applications to multiple regions.", answer: "No" },
    ],
    explanation:
      "Statement 1: No — not all Azure regions support AZs (only specific regions have 3+ datacenters). Statement 2: No — any VM type (Linux, Windows) can use AZs. Statement 3: No — AZs are within a SINGLE region (multiple datacenters in one region). For multi-region replication, you use region pairs or geo-redundant storage.",
    confidence: "high",
  },
  // ── Q109 ─────────────────────────────────────────────────────────────────
  {
    id: 109,
    type: "single",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question:
      "You plan to create an Azure virtual machine. You need to identify which storage service must be used to store the unmanaged data disks of the virtual machine. Which service should you identify?",
    options: [
      "A. Containers (Blob storage)",
      "B. File shares",
      "C. Tables",
      "D. Queues",
    ],
    answer: "A",
    answerText: "A. Containers (Blob storage)",
    explanation:
      "Unmanaged VM disks (VHDs) are stored as page blobs in Azure Blob Storage Containers. The VHD file is a page blob in a storage account container. Managed disks abstract this away, but unmanaged disks require you to create and manage the blob storage yourself.",
    confidence: "high",
  },
  // ── Q110 ─────────────────────────────────────────────────────────────────
  {
    id: 110,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question:
      "Your company plans to move several servers to Azure. The company's compliance policy states that a server named FinServer must be on a separate network segment. You are evaluating which Azure services can be used to meet the compliance policy requirements. Which Azure solution should you recommend?",
    options: [
      "A. a resource group for FinServer and another resource group for all the other servers",
      "B. a virtual network for FinServer and another virtual network for all the other servers",
      "C. a VPN for FinServer and a virtual network gateway for each other server",
      "D. one resource group for all the servers and a resource lock for FinServer",
    ],
    answer: "B",
    answerText: "B. a virtual network for FinServer and another virtual network for all the other servers",
    explanation:
      "Virtual networks provide network-level isolation and segmentation. By placing FinServer in its own VNet, it is on a completely separate network segment from other servers. Resource groups are logical containers (not network isolation). VPN/gateways are for connectivity, not segmentation.",
    confidence: "high",
  },
  // ── Q111 ─────────────────────────────────────────────────────────────────
  {
    id: 111,
    type: "single",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question:
      "You plan to map a network drive from several computers that run Windows 10 to Azure Storage. You need to create a storage solution in Azure for the planned mapped drive. What should you create?",
    options: [
      "A. an Azure SQL database",
      "B. a virtual machine data disk",
      "C. a File service in a storage account",
      "D. a Blob service in a storage account",
    ],
    answer: "C",
    answerText: "C. a File service in a storage account",
    explanation:
      "Azure Files is a fully managed file share in the cloud accessible via the SMB protocol — the same protocol used for Windows network drives. You can mount Azure File shares as network drives on Windows computers. Blob storage does not support SMB mounting.",
    confidence: "high",
  },
  // ── Q112 ─────────────────────────────────────────────────────────────────
  {
    id: 112,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question:
      "You plan to implement a NoSQL database solution that stores JSON documents, is globally distributed, and can automatically and elastically scale throughput and storage across any number of Azure regions. Which database service should you deploy?",
    options: [
      "A. Azure Cosmos DB",
      "B. Azure Database for MySQL servers",
      "C. SQL Data warehouses",
      "D. Azure SQL Database",
    ],
    answer: "A",
    answerText: "A. Azure Cosmos DB",
    explanation:
      "Azure Cosmos DB is Microsoft's globally distributed, multi-model NoSQL database. It natively stores JSON documents, supports automatic elastic scaling, and can replicate data across multiple Azure regions with low latency. Azure SQL Database and MySQL are relational (SQL) databases, not NoSQL.",
    confidence: "high",
  },
  // ── Q113 ─────────────────────────────────────────────────────────────────
  {
    id: 113,
    type: "single",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "Your company plans to start using Azure and will migrate all its network resources to Azure. You need to start the planning process by exploring Azure. What should you create first?",
    options: [
      "A. a subscription",
      "B. a resource group",
      "C. a virtual network",
      "D. a management group",
    ],
    answer: "A",
    answerText: "A. a subscription",
    explanation:
      "A subscription is the fundamental unit required to use Azure services. All other resources (resource groups, VNets, management groups) require a subscription to exist. You must create a subscription first before you can deploy any Azure resources.",
    confidence: "high",
  },
  // ── Q114 ─────────────────────────────────────────────────────────────────
  {
    id: 114,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "HOTSPOT — For each of the following statements about Azure resource groups, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "All the Azure resources deployed to a resource group must use the same Azure region.", answer: "No" },
      { text: "If you assign a tag to a resource group, all the Azure resources in that resource group are assigned the same tag.", answer: "No" },
      { text: "If you assign permissions for a user to manage a resource group, the user can manage all the Azure resources in that resource group.", answer: "Yes" },
    ],
    explanation:
      "Statement 1: No — resources in a resource group can be in different regions (the resource group itself has a region for metadata, but resources can be anywhere). Statement 2: No — tags assigned to a resource group are NOT automatically inherited by resources inside it. Statement 3: Yes — RBAC permissions assigned at the resource group level are inherited by all resources within it.",
    confidence: "high",
  },
  // ── Q115 ─────────────────────────────────────────────────────────────────
  {
    id: 115,
    type: "dropdown",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question: "HOTSPOT — To complete the sentence, select the appropriate option.",
    segments: [
      { text: "Data that is stored in the Archive access tier of an Azure Storage account " },
      {
        blank: "BLANK1",
        options: [
          "can be accessed at any time by using azcopy etc.",
          "can only be read by using Azure Backup",
          "must be removed before the data can be accessed",
          "must be rehydrated before the data can be accessed",
        ],
        answer: "must be rehydrated before the data can be accessed",
      },
      { text: "." },
    ],
    explanation:
      "Archive tier data is offline and cannot be read directly. To access it, you must first 'rehydrate' it — move it to Hot or Cool tier — which can take up to 15 hours. This is why Archive is cheapest for storage but has the highest access latency.",
    confidence: "high",
  },
  // ── Q116 ─────────────────────────────────────────────────────────────────
  {
    id: 116,
    type: "dropdown",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "HOTSPOT — A critical LOB application requires 99.99% availability. Select the minimum numbers required.",
    segments: [
      { text: "Minimum number of virtual machines: " },
      {
        blank: "BLANK1",
        options: ["1", "2", "3", "5"],
        answer: "2",
      },
      { text: " | Minimum number of availability zones: " },
      {
        blank: "BLANK2",
        options: ["1", "2", "3", "5"],
        answer: "2",
      },
    ],
    explanation:
      "To achieve 99.99% SLA with Azure VMs, you need at least 2 VMs deployed across at least 2 Availability Zones within a region. A single VM provides only 99.9% SLA. Two VMs in one AZ provides 99.95% SLA. Two VMs across two AZs achieves 99.99% SLA.",
    confidence: "high",
  },
  // ── Q117 ─────────────────────────────────────────────────────────────────
  {
    id: 117,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question:
      "Which Azure service should you use to collect events from multiple resources into a centralized repository?",
    options: [
      "A. Azure Event Hubs",
      "B. Azure Analysis Services",
      "C. Azure Monitor",
      "D. Azure Stream Analytics",
    ],
    answer: "A",
    answerText: "A. Azure Event Hubs",
    explanation:
      "⚠️ DEBATED (50% Event Hubs / 49% Azure Monitor). Azure Event Hubs is a big data streaming platform and event ingestion service — it can receive millions of events per second from multiple sources into a centralized repository. Azure Monitor collects metrics and logs for analysis, but Event Hubs is specifically designed for high-throughput event collection from multiple resources.",
    confidence: "medium",
  },
  // ── Q118 ─────────────────────────────────────────────────────────────────
  {
    id: 118,
    type: "dropdown",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — To complete the sentence, select the appropriate option.",
    segments: [
      { text: "An Availability Zone in Azure has physically separate locations " },
      {
        blank: "BLANK1",
        options: [
          "across two continents.",
          "within a single Azure region.",
          "within multiple Azure regions.",
          "within a single Azure datacenter.",
        ],
        answer: "within a single Azure region.",
      },
    ],
    explanation:
      "Azure Availability Zones are unique physical locations (datacenters) within a single Azure region. Each zone has independent power, cooling, and networking. They protect against datacenter-level failures while keeping resources in the same region.",
    confidence: "high",
  },
  // ── Q119 ─────────────────────────────────────────────────────────────────
  {
    id: 119,
    type: "hotspot",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question:
      "HOTSPOT — For each of the following statements about Azure Storage, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Data that is stored in an Azure Storage account automatically has at least three copies.", answer: "Yes" },
      { text: "All data that is copied to an Azure Storage account is backed up automatically to another Azure data center.", answer: "No" },
      { text: "An Azure Storage account can contain up to 2 TB of data and up to one million files.", answer: "No" },
    ],
    explanation:
      "Statement 1: Yes — Azure Storage always maintains a minimum of 3 copies (LRS = 3 copies within one datacenter). Statement 2: No — default LRS keeps 3 copies in ONE datacenter; cross-datacenter replication requires GRS/RA-GRS, which is not the default. Statement 3: No — Azure Storage supports up to 5 PiB (petabytes), not 2 TB. There is no such small storage limit.",
    confidence: "high",
  },
  // ── Q120 ─────────────────────────────────────────────────────────────────
  {
    id: 120,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question:
      "HOTSPOT — For each of the following statements about Azure Availability Zones, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "If you have Azure resources deployed to every region, you can implement availability zones in all the regions.", answer: "No" },
      { text: "Only virtual machines that run Windows Server can be created in availability zones.", answer: "No" },
      { text: "Availability zones are used to replicate data and applications to multiple regions.", answer: "No" },
    ],
    explanation:
      "Statement 1: No — AZ support is specific to certain Azure regions; not all regions have AZs. Statement 2: No — both Linux and Windows VMs (and other services like managed disks, load balancers) support AZs. Statement 3: No — AZs replicate within ONE region across multiple datacenters. Multi-region replication uses geo-redundancy (GRS) or region pairs.",
    confidence: "high",
  },
  // ── Q121 ─────────────────────────────────────────────────────────────────
  {
    id: 121,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — For each of the following statements about Azure regions, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "North America is represented by a single Azure region.", answer: "No" },
      { text: "Every Azure region has multiple datacenters.", answer: "Yes" },
      { text: "Data transfers between Azure services located in different Azure regions are always free.", answer: "No" },
    ],
    explanation: "Statement 1: No — North America has many Azure regions (East US, West US, Canada Central, etc.). Statement 2: Yes — each Azure region consists of multiple datacenters. Statement 3: No — outbound data transfers between Azure regions incur charges; only inbound is free.",
    confidence: "high",
  },
  // ── Q122 ─────────────────────────────────────────────────────────────────
  {
    id: 122,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You plan to deploy several Azure virtual machines. You need to ensure that the services running on the virtual machines are available if a single data center fails.\nSolution: You deploy the virtual machines to two or more scale sets.\nDoes this meet the goal?",
    options: ["A. Yes", "B. No"],
    answer: "B",
    answerText: "B. No",
    explanation: "Scale sets enable auto-scaling but don't guarantee cross-datacenter distribution by default. To protect against a single datacenter failure, deploy VMs across Availability Zones or multiple regions.",
    confidence: "high",
  },
  // ── Q123 ─────────────────────────────────────────────────────────────────
  {
    id: 123,
    type: "single",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "You need to be notified when Microsoft plans to perform maintenance that can affect the resources deployed to an Azure subscription. What should you use?",
    options: ["A. Azure Monitor", "B. Azure Service Health", "C. Azure Advisor", "D. Microsoft Trust Center"],
    answer: "B",
    answerText: "B. Azure Service Health",
    explanation: "Azure Service Health sends personalized alerts for planned maintenance, service issues, and health advisories affecting your specific subscriptions and regions. Azure Monitor tracks resource metrics. Azure Advisor gives optimization recommendations. Microsoft Trust Center covers compliance documentation.",
    confidence: "high",
  },
  // ── Q124 ─────────────────────────────────────────────────────────────────
  {
    id: 124,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure IoT service to its description.",
    pairs: [
      { left: "A managed service that provides bidirectional communication between IoT devices and Azure.", right: "IoT Hub" },
      { left: "A fully managed SaaS solution to connect, monitor, and manage IoT devices at scale.", right: "IoT Central" },
      { left: "A software and hardware solution that provides communication and security features for IoT devices.", right: "Azure Sphere" },
    ],
    explanation: "IoT Hub = managed bidirectional device messaging. IoT Central = SaaS IoT device management platform. Azure Sphere = hardware+OS+cloud security solution for IoT devices.",
    confidence: "high",
  },
  // ── Q125 ─────────────────────────────────────────────────────────────────
  {
    id: 125,
    type: "hotspot",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — For each of the following statements about Azure Virtual Desktop, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "A Windows Virtual Desktop session host can run Windows 10 only.", answer: "No" },
      { text: "A Windows Virtual Desktop host pool that includes 20 session hosts supports a maximum of 20 simultaneous user connections.", answer: "No" },
      { text: "Windows Virtual Desktop supports desktop and app virtualization.", answer: "Yes" },
    ],
    explanation: "Statement 1: No — AVD supports Windows 7, Windows 10, Windows 11, and Windows Server. Statement 2: No — multiple users can connect per session host (multi-session). Statement 3: Yes — AVD provides full desktop and RemoteApp (individual app) virtualization.",
    confidence: "high",
  },
  // ── Q126 ─────────────────────────────────────────────────────────────────
  {
    id: 126,
    type: "dropdown",
    topic: "AzureCost",
    topicLabel: "Azure Pricing & Cost Management",
    question: "HOTSPOT — To complete the sentence, select the appropriate option.",
    segments: [
      {
        blank: "BLANK1",
        options: ["The Azure Migrate: Server Assessment tool", "The Azure Total Cost of Ownership (TCO) calculator", "The Database Migration Assistant", "The pricing calculator in Azure"],
        answer: "The Azure Total Cost of Ownership (TCO) calculator",
      },
      { text: " can calculate cost savings due to reduced electricity consumption as a result of migrating on-premises Microsoft SQL servers to Azure." },
    ],
    explanation: "The Azure TCO Calculator compares on-premises costs (hardware, electricity, cooling, labor) with Azure costs. It specifically models electricity savings from eliminating on-premises datacenters.",
    confidence: "high",
  },
  // ── Q127 ─────────────────────────────────────────────────────────────────
  {
    id: 127,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — For each of the following statements about Azure Availability Zones, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You can use Availability Zones in Azure to protect Azure virtual machines from a datacenter failure.", answer: "Yes" },
      { text: "You can use Availability Zones in Azure to protect Azure virtual machines from a region failure.", answer: "No" },
      { text: "You can use Availability Zones in Azure to protect Azure managed disks from a datacenter failure.", answer: "Yes" },
    ],
    explanation: "Statement 1: Yes — AZs protect against datacenter failures. Statement 2: No — AZs do NOT protect against region failures (use geo-redundancy for that). Statement 3: Yes — Azure managed disks support zone-redundant storage.",
    confidence: "high",
  },
  // ── Q130 ─────────────────────────────────────────────────────────────────
  {
    id: 130,
    type: "hotspot",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each of the following statements about Azure Active Directory, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "To use Azure AD credentials to sign in to a computer that runs Windows 10, the computer must be joined to Azure AD.", answer: "Yes" },
      { text: "Users in Azure Active Directory (Azure AD) are organized by using resource groups.", answer: "No" },
      { text: "Azure Active Directory (Azure AD) groups support dynamic membership rules.", answer: "Yes" },
    ],
    explanation: "Statement 1: Yes — device must be Azure AD Joined for Azure AD credential sign-in. Statement 2: No — users are organized in Azure AD groups/OUs, not resource groups. Statement 3: Yes — Azure AD supports dynamic group membership based on user attributes.",
    confidence: "high",
  },
  // ── Q131 ─────────────────────────────────────────────────────────────────
  {
    id: 131,
    type: "multi",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You plan to deploy several Azure virtual machines. You need to ensure that the services running on the virtual machines remain available if a single data center fails. What are two possible solutions?",
    options: [
      "A. Deploy the virtual machines to two or more availability zones.",
      "B. Deploy the virtual machines to two or more resource groups.",
      "C. Deploy the virtual machines to a scale set.",
      "D. Deploy the virtual machines to two or more regions.",
    ],
    answer: ["A", "D"],
    answerCount: 2,
    answerText: "A and D",
    explanation: "A: AZs = separate physical datacenters within one region, protecting against datacenter failure. D: Multiple regions = even broader protection. B: Resource groups = logical containers, no physical separation. C: Scale sets alone don't guarantee cross-datacenter placement.",
    confidence: "high",
  },
  // ── Q132 ─────────────────────────────────────────────────────────────────
  {
    id: 132,
    type: "dropdown",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "HOTSPOT — To ensure VM1 cannot connect to the other virtual machines, VM1 must [dropdown].",
    segments: [
      { text: "To ensure VM1 cannot connect to the other virtual machines, VM1 must " },
      {
        blank: "BLANK1",
        options: ["be deployed to a separate virtual network.", "run a different operating system than the other virtual machines.", "be deployed to a separate resource group.", "have two network interfaces."],
        answer: "be deployed to a separate virtual network.",
      },
    ],
    explanation: "Azure VNets provide network isolation. VMs in different VNets cannot communicate without VNet Peering or a VPN Gateway. Separate resource groups, OS types, or network interfaces do not provide network isolation.",
    confidence: "high",
  },
  // ── Q133 ─────────────────────────────────────────────────────────────────
  {
    id: 133,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure data service to its description.",
    pairs: [
      { left: "A fully managed data warehouse that has integral security at every level of scale at no extra cost.", right: "Azure Synapse Analytics" },
      { left: "A globally distributed database that supports NoSQL.", right: "Azure Cosmos DB" },
      { left: "Managed Apache Hadoop clusters in the cloud that enable you to process massive amounts of data.", right: "Azure HDInsight" },
    ],
    explanation: "Azure Synapse Analytics = enterprise data warehouse. Azure Cosmos DB = globally distributed NoSQL database. Azure HDInsight = managed Hadoop/Spark clusters for big data.",
    confidence: "high",
  },
  // ── Q134 ─────────────────────────────────────────────────────────────────
  {
    id: 134,
    type: "hotspot",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question: "HOTSPOT — For each of the following statements about Azure Storage access tiers, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "The Archive access tier is set at the storage account level.", answer: "No" },
      { text: "The Hot access tier is recommended for data that is accessed and modified frequently.", answer: "Yes" },
      { text: "The Cool access tier is recommended for long-term backups.", answer: "No" },
    ],
    explanation: "Statement 1: No — Archive is set at the blob level, not account level. Statement 2: Yes — Hot tier is for frequently accessed data. Statement 3: No — Archive tier is for long-term backups; Cool tier is for data infrequently accessed for 30+ days.",
    confidence: "high",
  },
  // ── Q135 ─────────────────────────────────────────────────────────────────
  {
    id: 135,
    type: "single",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "What is the most severe failure from which an Azure Availability Zone can be used to protect access to Azure services?",
    options: ["A. a physical server failure", "B. an Azure region failure", "C. a storage failure", "D. an Azure data center failure"],
    answer: "D",
    answerText: "D. an Azure data center failure",
    explanation: "AZs protect against datacenter-level failures (the most severe physical failure within one region). They do NOT protect against full region failures.",
    confidence: "high",
  },
  // ── Q136 ─────────────────────────────────────────────────────────────────
  {
    id: 136,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You need to purchase a third-party virtual security appliance that you will deploy to an Azure subscription. What should you use?",
    options: ["A. Azure subscriptions", "B. Azure Security Center", "C. Azure Marketplace", "D. Microsoft Store"],
    answer: "C",
    answerText: "C. Azure Marketplace",
    explanation: "Azure Marketplace is the online store for certified third-party software including virtual network appliances (firewalls, IDS/IPS) from ISVs. You can browse, purchase, and deploy directly to Azure.",
    confidence: "high",
  },
  // ── Q137 ─────────────────────────────────────────────────────────────────
  {
    id: 137,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each serverless solution to its characteristic.",
    pairs: [
      { left: "Executes code:", right: "Azure Functions" },
      { left: "Is always stateful:", right: "Azure Logic Apps" },
      { left: "Runs only in the cloud:", right: "Azure Logic Apps" },
    ],
    explanation: "Azure Functions = event-driven code execution. Azure Logic Apps = always stateful workflow automation (consumption plan runs only in cloud). Functions can run on-premises via containers.",
    confidence: "high",
  },
  // ── Q138 ─────────────────────────────────────────────────────────────────
  {
    id: 138,
    type: "matching",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "DRAG DROP — Match each Azure governance feature to its description.",
    pairs: [
      { left: "Restrict which virtual machine types can be created in a subscription.", right: "Azure Policy" },
      { left: "Identify Azure resources that are associated with specific cost centers.", right: "Azure tags" },
      { left: "Deploy a complete Azure application environment including resources configuration and role assignments.", right: "Azure Blueprints" },
    ],
    explanation: "Azure Policy = enforce compliance rules on resource types/configs. Azure Tags = key/value metadata for cost tracking. Azure Blueprints = packaged environment templates (ARM + RBAC + Policy).",
    confidence: "high",
  },
  // ── Q140 ─────────────────────────────────────────────────────────────────
  {
    id: 140,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure service to its description.",
    pairs: [
      { left: "Provide operating system virtualization.", right: "Azure virtual machines" },
      { left: "Provide portable environment for virtualized applications.", right: "Azure Container Instances" },
      { left: "Used to build, deploy, and scale web apps.", right: "Azure App Service" },
      { left: "Provide a platform for serverless code.", right: "Azure Functions" },
    ],
    explanation: "Azure VMs = OS virtualization (IaaS). Container Instances = portable containerized apps. App Service = PaaS web app platform. Azure Functions = serverless code execution.",
    confidence: "high",
  },
  {
    id: 141,
    type: "dropdown",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — You have several virtual machines in an Azure subscription. You create a new subscription. Select the answer that correctly completes the sentence.",
    segments: [
      { text: "The virtual machines " },
      { blank: "BLANK1", options: ["cannot be moved to the new subscription.", "can be moved to the new subscription only if they are in the same resource group.", "can be moved to the new subscription only if they run Windows Server 2019.", "can be moved to the new subscription."], answer: "can be moved to the new subscription only if they are in the same resource group." },
    ],
    explanation: "Azure resources including VMs can be moved between subscriptions. The exam answer indicates they must be in the same resource group for the move. Note: community debate exists on this — in practice, Azure allows cross-subscription moves with or without same resource group.",
    confidence: "medium",
  },
  {
    id: 142,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You need to purchase a third-party virtual security appliance that you will deploy to an Azure subscription. What should you use?",
    options: ["A. Azure subscriptions", "B. Microsoft Defender for Cloud", "C. Azure Marketplace", "D. Microsoft Store"],
    answer: "C",
    answerText: "C. Azure Marketplace",
    explanation: "Azure Marketplace is the online store where you can find and purchase third-party solutions, including virtual security appliances, to deploy in Azure.",
    confidence: "high",
  },
  {
    id: 143,
    type: "dropdown",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { blank: "BLANK1", options: ["Azure Arc", "Azure IoT Central", "Azure IoT Hub", "Azure Sphere"], answer: "Azure Sphere" },
      { text: " is a highly secure IoT solution that includes a microcontroller unit (MCU) and a customized Linux operating system." },
    ],
    explanation: "Azure Sphere is Microsoft's IoT security solution consisting of a certified MCU, a custom Linux-based OS, and a cloud security service to keep IoT devices secure.",
    confidence: "high",
  },
  {
    id: 144,
    type: "single",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You plan to deploy a service to Azure virtual machines. You need to ensure that the service will be available if a datacenter fails. What should you use as part of the virtual machine deployment?",
    options: ["A. availability sets", "B. proximity placement groups", "C. host groups", "D. availability zones"],
    answer: "D",
    answerText: "D. availability zones",
    explanation: "Availability zones are physically separate datacenters within an Azure region. Deploying VMs to two or more availability zones protects services from a single datacenter failure.",
    confidence: "high",
  },
  {
    id: 145,
    type: "single",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "Your company has an Azure subscription that contains resources in several regions. You need to ensure that administrators can only create resources in those regions. What should you use?",
    options: ["A. a read-only lock", "B. an Azure policy", "C. a management group", "D. a reservation"],
    answer: "B",
    answerText: "B. an Azure policy",
    explanation: "Azure Policy can enforce rules on resource creation, including restricting which regions resources can be deployed to. A policy with 'allowed locations' effect achieves this goal.",
    confidence: "high",
  },
  {
    id: 146,
    type: "dropdown",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "An Azure region " },
      { blank: "BLANK1", options: ["contains one or more data centers that are connected by using a low-latency network.", "is found in each country where Microsoft has a subsidiary office.", "can be found in every country in Europe and the Americas only.", "contains one or more data centers that are connected by using a high-latency network."], answer: "contains one or more data centers that are connected by using a low-latency network." },
    ],
    explanation: "An Azure region is a set of datacenters deployed within a latency-defined perimeter, connected through a dedicated regional low-latency network backbone.",
    confidence: "high",
  },
  {
    id: 147,
    type: "dropdown",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "You can use the Azure File Sync agent to sync on-premises data to an Azure " },
      { blank: "BLANK1", options: ["blob container.", "Data Lake Storage container.", "file share.", "queue."], answer: "file share." },
    ],
    explanation: "Azure File Sync enables synchronization of on-premises Windows file servers with Azure Files (file shares). It caches frequently accessed files locally while storing the full dataset in Azure.",
    confidence: "high",
  },
  {
    id: 148,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "What is the function of a Site-to-Site VPN?",
    options: ["A. provides a secure connection between a computer on a public network and the corporate network", "B. provides a dedicated private connection to Azure that does NOT travel over the internet", "C. provides a connection from an on-premises VPN device to an Azure VPN gateway"],
    answer: "C",
    answerText: "C. provides a connection from an on-premises VPN device to an Azure VPN gateway",
    explanation: "A Site-to-Site VPN connects an on-premises VPN device to an Azure VPN Gateway over the public internet using an encrypted IPsec/IKE tunnel, linking entire networks.",
    confidence: "high",
  },
  {
    id: 149,
    type: "matching",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question: "DRAG DROP — Match the cloud service models to the appropriate Azure offerings.",
    pairs: [
      { left: "Infrastructure as a Service (IaaS)", right: "Azure virtual machines" },
      { left: "Platform as a Service (PaaS)", right: "Azure App Service" },
      { left: "Software as a Service (SaaS)", right: "Microsoft Dynamics 365" },
    ],
    explanation: "IaaS: VMs provide OS-level infrastructure. PaaS: App Service provides a managed platform for web apps. SaaS: Dynamics 365 is a fully managed business application.",
    confidence: "high",
  },
  {
    id: 150,
    type: "matching",
    topic: "CloudModels",
    topicLabel: "Cloud Service Models",
    question: "DRAG DROP — Match the cloud service models to the appropriate solutions.",
    pairs: [
      { left: "A cloud-based file server", right: "Infrastructure-as-a-Service (IaaS)" },
      { left: "A cloud-based accounting system", right: "Software-as-a-Service (SaaS)" },
      { left: "A cloud-based service for custom apps", right: "Platform-as-a-Service (PaaS)" },
    ],
    explanation: "A file server requires infrastructure management (IaaS). An accounting system is a ready-to-use application (SaaS). A service for custom app development/hosting is PaaS.",
    confidence: "high",
  },
  {
    id: 151,
    type: "multi",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You need to manage containers. Which two services can you use? Each correct answer presents a complete solution.",
    options: ["A. Azure Virtual Desktop", "B. Azure virtual machines", "C. Azure Functions", "D. Azure Container Instances", "E. Azure Kubernetes Service (AKS)"],
    answer: ["D", "E"],
    answerCount: 2,
    answerText: "D and E",
    explanation: "Azure Container Instances (ACI) runs individual containers without managing VMs. Azure Kubernetes Service (AKS) is a managed Kubernetes service for orchestrating containerized workloads.",
    confidence: "high",
  },
  {
    id: 152,
    type: "dropdown",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "When you need to delegate permissions to several Azure virtual machines simultaneously, you must deploy the Azure virtual machines " },
      { blank: "BLANK1", options: ["to the same Azure region.", "to the same Azure Resource Manager template.", "to the same resource group.", "to the same availability zone."], answer: "to the same resource group." },
    ],
    explanation: "RBAC permissions in Azure can be assigned at the resource group scope, applying to all resources within that group. To delegate permissions to multiple VMs at once, place them in the same resource group.",
    confidence: "high",
  },
  {
    id: 153,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You plan to deploy several Azure virtual machines. You need to ensure that the services running on the virtual machines are available if a single data center fails.\n\nSolution: You deploy the virtual machines to two or more availability zones.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Availability zones are physically separate datacenters within an Azure region. Deploying VMs across two or more AZs protects against a single datacenter failure.",
    confidence: "high",
  },
  {
    id: 154,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "This question requires you to evaluate the underlined text to determine if it is correct.\n\nOne of the benefits of Azure SQL Data Warehouse is that [high availability] is built into the platform.\n\nReview the underlined text. If it makes the statement correct, select 'No change is needed'. If incorrect, select the answer choice that makes the statement correct.",
    options: ["A. No change is needed", "B. automatic scaling", "C. data compression", "D. versioning"],
    answer: "A",
    answerText: "A. No change is needed",
    explanation: "High availability IS a built-in benefit of Azure SQL Data Warehouse (now Azure Synapse Analytics). The statement is correct as written.",
    confidence: "high",
  },
  {
    id: 155,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You plan to deploy several Azure virtual machines. You need to ensure that the services running on the virtual machines are available if a single data center fails.\n\nSolution: You deploy the virtual machines to two or more regions.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Deploying VMs to multiple Azure regions ensures availability even if an entire datacenter (or region) fails. This exceeds the requirement (AZs would suffice) but still meets the goal. Note: 73% of community votes Yes.",
    confidence: "medium",
  },
  {
    id: 156,
    type: "dropdown",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "An Azure container instance is an example of an Azure " },
      { blank: "BLANK1", options: ["compute service.", "identity service.", "networking service.", "storage service."], answer: "compute service." },
    ],
    explanation: "Azure Container Instances is a compute service — it runs container workloads. Compute services include VMs, App Service, Functions, AKS, and Container Instances.",
    confidence: "high",
  },
  {
    id: 157,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "At which OSI layer does ExpressRoute operate?",
    options: ["A. Layer 2", "B. Layer 3", "C. Layer 5", "D. Layer 7"],
    answer: "B",
    answerText: "B. Layer 3",
    explanation: "Azure ExpressRoute operates at OSI Layer 3 (Network layer). It provides dedicated private connectivity using BGP routing protocols, which operate at Layer 3.",
    confidence: "high",
  },
  {
    id: 158,
    type: "dropdown",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Application Insights is a feature of " },
      { blank: "BLANK1", options: ["Azure Advisor.", "Azure Application Gateway.", "Azure Arc.", "Azure Monitor."], answer: "Azure Monitor." },
    ],
    explanation: "Application Insights is a feature of Azure Monitor. It provides extensible application performance management (APM) and monitoring for live web applications.",
    confidence: "high",
  },
  {
    id: 159,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — For each of the following statements, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure resources can only access other resources in the same resource group.", answer: "No" },
      { text: "If you delete a resource group, all the resources in the resource group will be deleted.", answer: "Yes" },
      { text: "Azure resources can access resources from multiple Azure regions.", answer: "Yes" },
    ],
    explanation: "Resources across different resource groups can communicate freely. Deleting a resource group deletes all contained resources. Resources are not region-locked — they can access other resources across regions.",
    confidence: "high",
  },
  {
    id: 160,
    type: "multi",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question: "You plan to store 20 TB of data in Azure. The data will be accessed infrequently and visualized by using Microsoft Power BI. You need to recommend a storage solution for the data. Which two solutions should you recommend? Each correct answer presents a complete solution.",
    options: ["A. Azure Data Lake", "B. Azure Cosmos DB", "C. Azure SQL Data Warehouse", "D. Azure SQL Database", "E. Azure Database for PostgreSQL"],
    answer: ["A", "C"],
    answerCount: 2,
    answerText: "A and C",
    explanation: "Azure Data Lake is designed for large-scale analytics data storage (big data). Azure SQL Data Warehouse (Synapse Analytics) is designed for large-scale analytical queries and integrates natively with Power BI.",
    confidence: "high",
  },
  {
    id: 161,
    type: "dropdown",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — You have an Azure environment that contains 10 web apps. To which URL should you connect to manage all the Azure resources? Select the appropriate options in the answer area.",
    segments: [
      { text: "https://" },
      { blank: "BLANK1", options: ["admin.", "portal.", "www."], answer: "portal." },
      { blank: "BLANK2", options: ["azure.", "azurewebsites.", "microsoft."], answer: "azure." },
      { text: "com" },
    ],
    explanation: "The Azure portal URL is https://portal.azure.com. This web-based interface lets you manage all Azure resources in one place.",
    confidence: "high",
  },
  {
    id: 162,
    type: "dragdrop",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question: "DRAG DROP — Arrange the storage account redundancy options from the least redundant to the most redundant.",
    items: ["Zone-redundant storage (ZRS)", "Geo-redundant storage (GRS)", "Locally-redundant storage (LRS)"],
    slots: ["Least redundant", "Middle", "Most redundant"],
    answer: ["Locally-redundant storage (LRS)", "Zone-redundant storage (ZRS)", "Geo-redundant storage (GRS)"],
    explanation: "LRS replicates 3 copies within a single datacenter (least). ZRS replicates across 3 availability zones in a region (middle). GRS replicates to a secondary region (most redundant).",
    confidence: "high",
  },
  {
    id: 163,
    type: "dropdown",
    topic: "AzureStorage",
    topicLabel: "Azure Storage",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Azure Blob Storage is a " },
      { blank: "BLANK1", options: ["data store for queuing and reliably delivering messages between applications.", "file share that can be mapped as a network drive.", "key/attribute store for non-relational, structured data.", "storage service optimized for very large objects, such as video files and bitmaps."], answer: "storage service optimized for very large objects, such as video files and bitmaps." },
    ],
    explanation: "Azure Blob Storage is optimized for storing massive amounts of unstructured data including text, binary data, images, audio, video, and log files.",
    confidence: "high",
  },
  {
    id: 164,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "An Azure administrator plans to run a PowerShell script that creates Azure resources.\n\nSolution: Run the script from a computer that runs Linux and has the Azure CLI tools installed.\n\nDoes this meet the goal?",
    answer: "No",
    explanation: "Azure CLI tools are not the same as PowerShell. To run a PowerShell script, you need PowerShell (with the Az module) installed — not Azure CLI. Azure CLI uses 'az' commands, not PowerShell cmdlets.",
    confidence: "high",
  },
  {
    id: 165,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "An Azure administrator plans to run a PowerShell script that creates Azure resources.\n\nSolution: Run the script from a computer that runs Chrome OS and uses Azure Cloud Shell.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Azure Cloud Shell supports both PowerShell and Bash, is accessible from any browser including Chrome OS, and has the Azure PowerShell modules pre-installed.",
    confidence: "high",
  },
  {
    id: 166,
    type: "hotspot",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — For each of the following statements about Azure Service Health, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "From Azure Service Health, an administrator can view the health of all the services in an Azure environment.", answer: "Yes" },
      { text: "From Azure Service Health, an administrator can create a rule to be alerted if an Azure service fails.", answer: "Yes" },
      { text: "From Azure Service Health, an administrator can prevent a service failure.", answer: "No" },
    ],
    explanation: "Azure Service Health provides status of Azure services and can send alerts. However, it cannot prevent outages — it only provides awareness and guidance for mitigation.",
    confidence: "high",
  },
  {
    id: 167,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "An Azure administrator plans to run a PowerShell script that creates Azure resources.\n\nSolution: Run the script from a computer that runs macOS and has PowerShell Core 6.0 installed.\n\nDoes this meet the goal?",
    answer: "No",
    explanation: "PowerShell Core 6.0 alone is insufficient. You also need the Azure Az PowerShell module installed. Without the Az module, you cannot create Azure resources via PowerShell. The solution is incomplete. Note: 42% of community votes Yes, making this debated.",
    confidence: "medium",
  },
  {
    id: 169,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure service to its description.",
    pairs: [
      { left: "An integrated solution for the deployment of code.", right: "Azure DevOps" },
      { left: "A tool that provides guidance and recommendations to improve an Azure environment.", right: "Azure Advisor" },
      { left: "A simplified tool to build intelligent Artificial Intelligence (AI) applications.", right: "Azure Cognitive Services" },
      { left: "Monitors web applications.", right: "Azure Application Insights" },
    ],
    explanation: "DevOps = CI/CD pipelines. Advisor = cost/security/performance recommendations. Cognitive Services = pre-built AI APIs. Application Insights (part of Azure Monitor) = web app APM.",
    confidence: "high",
  },
  {
    id: 170,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure service to its description.",
    pairs: [
      { left: "A managed relational cloud database service.", right: "Azure SQL Database" },
      { left: "A cloud-based service that leverages massively parallel processing (MPP) to quickly run complex queries across petabytes of data in a relational database.", right: "Azure Synapse Analytics" },
      { left: "Can run massively parallel data transformation and processing programs of big data with clusters.", right: "Azure HDInsight" },
      { left: "Processes data from millions of sensors.", right: "Azure IoT Hub" },
    ],
    explanation: "SQL Database = managed relational DB. Synapse Analytics = MPP data warehouse. HDInsight = managed Hadoop/Spark clusters. IoT Hub = central messaging hub for IoT devices at scale.",
    confidence: "high",
  },
  {
    id: 171,
    type: "hotspot",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — You need to identify which blades in the Azure portal must be used to perform the following tasks. Select the appropriate blade for each task.",
    statements: [
      { text: "Monitor the health of Azure services: Azure Monitor", answer: "Yes" },
      { text: "Browse available virtual machine images: Azure Marketplace", answer: "Yes" },
      { text: "View security recommendations: Azure Advisor", answer: "Yes" },
    ],
    explanation: "Azure Monitor = health and diagnostics. Azure Marketplace = browse VM images and third-party solutions. Azure Advisor = personalized best-practice recommendations including security.",
    confidence: "high",
  },
  {
    id: 172,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You have an Azure environment. You need to create a new Azure virtual machine from a tablet that runs the Android operating system.\n\nSolution: You use Bash in Azure Cloud Shell.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Azure Cloud Shell is browser-based and accessible from any device including Android tablets. Using Bash in Cloud Shell, you can run 'az vm create' commands to create VMs.",
    confidence: "high",
  },
  {
    id: 173,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You have an on-premises application that sends email notifications automatically based on a rule. You plan to migrate the application to Azure. You need to recommend a serverless computing solution for the application. What should you include in the recommendation?",
    options: ["A. a web app", "B. a server image in Azure Marketplace", "C. a logic app", "D. an API app"],
    answer: "C",
    answerText: "C. a logic app",
    explanation: "Azure Logic Apps is a serverless workflow automation service ideal for integrating systems and automating business processes like sending emails based on rules — without managing infrastructure.",
    confidence: "high",
  },
  {
    id: 174,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "You plan to deploy a website to Azure. The website will be accessed by users worldwide and will host large video files. You need to recommend which Azure feature must be used to provide the best video playback experience. What should you recommend?",
    options: ["A. an application gateway", "B. an Azure ExpressRoute circuit", "C. a content delivery network (CDN)", "D. an Azure Traffic Manager profile"],
    answer: "C",
    answerText: "C. a content delivery network (CDN)",
    explanation: "Azure CDN caches content at edge nodes geographically close to users worldwide, dramatically improving video streaming performance by reducing latency and bandwidth from the origin server.",
    confidence: "high",
  },
  {
    id: 175,
    type: "multi",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "Your company plans to deploy several million sensors that will upload data to Azure. You need to identify which Azure resources must be created to support the planned solution. Which two Azure resources should you identify? Each correct answer presents part of the solution.",
    options: ["A. Azure Data Lake", "B. Azure Queue storage", "C. Azure File Storage", "D. Azure IoT Hub", "E. Azure Notification Hubs"],
    answer: ["A", "D"],
    answerCount: 2,
    answerText: "A and D",
    explanation: "Azure IoT Hub is the cloud gateway for ingesting data from millions of IoT devices/sensors. Azure Data Lake stores and analyzes the massive amounts of data uploaded from those sensors.",
    confidence: "high",
  },
  {
    id: 176,
    type: "multi",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You have an Azure web app. You need to manage the settings of the web app from an iPhone. What are two Azure management tools that you can use? Each correct answer presents a complete solution.",
    options: ["A. Azure CLI", "B. the Azure portal", "C. Azure Cloud Shell", "D. Windows PowerShell", "E. Azure Storage Explorer"],
    answer: ["B", "C"],
    answerCount: 2,
    answerText: "B and C",
    explanation: "The Azure portal is a web-based interface accessible from any browser including iPhone Safari. Azure Cloud Shell also runs in a browser. Both work on mobile devices. Azure CLI and PowerShell require a local environment; Storage Explorer is a desktop app.",
    confidence: "high",
  },
  {
    id: 177,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "Your company plans to deploy an Artificial Intelligence (AI) solution in Azure. What should the company use to build, test, and deploy predictive analytics solutions?",
    options: ["A. Azure Logic Apps", "B. Azure Machine Learning Designer", "C. Azure Batch", "D. Azure Cosmos DB"],
    answer: "B",
    answerText: "B. Azure Machine Learning Designer",
    explanation: "Azure Machine Learning Designer provides a drag-and-drop visual interface to build, test, and deploy machine learning models and predictive analytics solutions without deep coding knowledge.",
    confidence: "high",
  },
  {
    id: 178,
    type: "hotspot",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — For each of the following statements about Azure Advisor, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Advisor can generate a list of Azure virtual machines that are protected by Azure Backup.", answer: "No" },
      { text: "If you implement the security recommendations provided by Azure Advisor, your company's secure score will decrease.", answer: "No" },
      { text: "To maintain Microsoft support, you must implement the security recommendations provided by Azure Advisor within a period of 30 days.", answer: "No" },
    ],
    explanation: "Azure Advisor does NOT list VMs protected by Backup. Implementing security recommendations increases (not decreases) the secure score. Advisor recommendations are optional suggestions — there is no mandatory compliance period for support.",
    confidence: "high",
  },
  {
    id: 179,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "What can you use to automatically send an alert if an administrator stops an Azure virtual machine?",
    options: ["A. Azure Advisor", "B. Azure Service Health", "C. Azure Monitor", "D. Azure Network Watcher"],
    answer: "C",
    answerText: "C. Azure Monitor",
    explanation: "Azure Monitor can create alert rules based on activity log events, including when a VM is stopped. It can trigger notifications via email, SMS, or other action groups.",
    confidence: "high",
  },
  {
    id: 180,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure service to its description.",
    pairs: [
      { left: "Provides a cloud-based Enterprise Data Warehouse (EDW).", right: "Azure Synapse Analytics" },
      { left: "Uses past training to provide predictions that have high probability.", right: "Azure Machine Learning" },
      { left: "Provides serverless computing functionalities.", right: "Azure Functions" },
      { left: "Processes data from millions of sensors.", right: "Azure IoT Hub" },
    ],
    explanation: "Synapse Analytics = cloud data warehouse. Machine Learning = predictive model training/inference. Functions = serverless compute triggered by events. IoT Hub = device-to-cloud messaging at IoT scale.",
    confidence: "high",
  },
  {
    id: 181,
    type: "multi",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You have an Azure environment. You need to create a new Azure virtual machine from a tablet that runs the Android operating system. What are three possible solutions? Each correct answer presents a complete solution.",
    options: ["A. Use Bash in Azure Cloud Shell.", "B. Use PowerShell in Azure Cloud Shell.", "C. Use the PowerApps portal.", "D. Use the Security & Compliance admin center.", "E. Use the Azure portal."],
    answer: ["A", "B", "E"],
    answerCount: 3,
    answerText: "A, B, and E",
    explanation: "Azure Cloud Shell (both Bash and PowerShell) and the Azure portal are all browser-based and work from Android tablets. PowerApps and Security & Compliance center are not VM creation tools.",
    confidence: "high",
  },
  {
    id: 182,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "A team of developers at your company plans to deploy, and then remove, 50 virtual machines each week. All the virtual machines are configured by using Azure Resource Manager templates. You need to recommend which Azure service will minimize the administrative effort required to deploy and remove the virtual machines. What should you recommend?",
    options: ["A. Azure Reserved Virtual Machine (VM) Instances", "B. Azure DevTest Labs", "C. Azure virtual machine scale sets", "D. Azure Virtual Desktop"],
    answer: "B",
    answerText: "B. Azure DevTest Labs",
    explanation: "Azure DevTest Labs lets you quickly create environments using reusable templates, automatically shuts down VMs, and streamlines the deploy/remove cycle for dev/test workloads. Note: 40% voted C (scale sets).",
    confidence: "medium",
  },
  {
    id: 183,
    type: "hotspot",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — For each of the following statements about Azure Advisor, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Advisor provides recommendations on how to improve the security of an Azure Active Directory (Azure AD) environment.", answer: "Yes" },
      { text: "Azure Advisor provides recommendations on how to reduce the cost of running Azure virtual machines.", answer: "Yes" },
      { text: "Azure Advisor provides recommendations on how to configure the network settings on Azure virtual machines.", answer: "No" },
    ],
    explanation: "Azure Advisor provides recommendations in five categories: Cost, Security, Reliability, Operational Excellence, and Performance. It does not configure network settings on individual VMs — it only advises.",
    confidence: "high",
  },
  {
    id: 184,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You have an Azure subscription named Subscription1. You sign in to the Azure portal and create a resource group named RG1. You have the Azure CLI command: az vm create --resource-group RG1 --name VM1 --image UbuntuLTS --generate-ssh-keys\n\nSolution: From the Azure portal, launch Azure Cloud Shell and select PowerShell. Run the command in Cloud Shell.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Azure Cloud Shell in PowerShell mode still includes the Azure CLI ('az' commands). You can run 'az vm create' from Cloud Shell regardless of whether you selected Bash or PowerShell mode. Note: 45% voted No.",
    confidence: "medium",
  },
  {
    id: 185,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You have an Azure subscription. You have the Azure CLI command: az vm create --resource-group RG1 --name VM1 --image UbuntuLTS --generate-ssh-keys\n\nSolution: From a computer that runs Windows 10, install Azure CLI. From PowerShell, sign in to Azure and then run the command.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Azure CLI can be installed on Windows and run from PowerShell. Once signed in with 'az login', you can execute any 'az' command including 'az vm create'. Note: 35% voted No.",
    confidence: "medium",
  },
  {
    id: 186,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "You have an Azure subscription. You have the Azure CLI command: az vm create --resource-group RG1 --name VM1 --image UbuntuLTS --generate-ssh-keys\n\nSolution: From a computer that runs Windows 10, install Azure CLI. From a command prompt, sign in to Azure and then run the command.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Azure CLI works from Windows Command Prompt after installation. Running 'az login' then 'az vm create' achieves the goal. Note: community split 53/47.",
    confidence: "medium",
  },
  {
    id: 187,
    type: "hotspot",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — You need to identify which Azure management tools can be used from each computer. For each computer, which tools can be used?",
    statements: [
      { text: "Computer1 (Windows): Azure CLI, Azure portal, and Azure PowerShell", answer: "Yes" },
      { text: "Computer2 (Linux): Azure CLI and Azure portal only (not Azure PowerShell)", answer: "Yes" },
      { text: "Computer3 (macOS Mojave): Azure CLI, Azure portal, and Azure PowerShell", answer: "Yes" },
    ],
    explanation: "Windows supports all tools. Linux supports Azure CLI and portal natively; Azure PowerShell Core can also run on Linux but the exam answer excludes it here. macOS supports all tools including PowerShell Core.",
    confidence: "high",
  },
  {
    id: 188,
    type: "dropdown",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "You can access Compliance Manager from the " },
      { blank: "BLANK1", options: ["Azure Active Directory admin center", "Azure portal", "Microsoft 365 admin center", "Microsoft Service Trust Portal"], answer: "Microsoft 365 admin center" },
    ],
    explanation: "Microsoft Compliance Manager is accessed through the Microsoft 365 compliance center (Microsoft 365 admin center). It helps organizations manage compliance across Microsoft cloud services.",
    confidence: "high",
  },
  {
    id: 189,
    type: "dropdown",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { blank: "BLANK1", options: ["Azure policies provide", "Resource groups provide", "Azure Resource Manager templates provide", "Management groups provide"], answer: "Azure Resource Manager templates provide" },
      { text: " a common platform for deploying objects to a cloud infrastructure and for implementing consistency across the Azure environment." },
    ],
    explanation: "Azure Resource Manager (ARM) templates define infrastructure as code, providing a consistent deployment platform for Azure resources. They ensure repeatable, consistent deployments across environments.",
    confidence: "high",
  },
  {
    id: 190,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure service to its description.",
    pairs: [
      { left: "Provides a digital online assistant that provides speech support.", right: "Azure Bot Services" },
      { left: "Uses past training to provide predictions that have high probability.", right: "Azure Machine Learning" },
      { left: "Provides serverless computing functionalities.", right: "Azure Functions" },
      { left: "Processes data from millions of sensors.", right: "Azure IoT Hub" },
    ],
    explanation: "Bot Services = conversational AI/chatbots with speech. Machine Learning = predictive models from training data. Functions = serverless compute. IoT Hub = telemetry ingestion from IoT devices.",
    confidence: "high",
  },
  {
    id: 191,
    type: "yesno",
    topic: "AzureArchitecture",
    topicLabel: "Azure Architecture & Management",
    question: "An Azure administrator plans to run a PowerShell script that creates Azure resources.\n\nSolution: Run the script from a computer that runs Windows 10 and has the Azure PowerShell module installed.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Windows 10 with the Azure PowerShell (Az) module installed is the standard and fully supported way to run PowerShell scripts that create Azure resources.",
    confidence: "high",
  },
  {
    id: 192,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure service to its description.",
    pairs: [
      { left: "Provide operating system virtualization.", right: "Azure virtual machines" },
      { left: "Provide portable environment for virtualized applications.", right: "Azure Container Instances" },
      { left: "Used to build, deploy, and scale web apps.", right: "Azure App Service" },
      { left: "Provide a platform for serverless code.", right: "Azure Functions" },
    ],
    explanation: "VMs = OS virtualization (IaaS). Container Instances = portable containerized environments. App Service = managed web app platform (PaaS). Functions = serverless event-driven code.",
    confidence: "high",
  },
  {
    id: 193,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "Which service provides serverless computing in Azure?",
    options: ["A. Azure Virtual Machines", "B. Azure Functions", "C. Azure storage account", "D. Azure dedicated hosts"],
    answer: "B",
    answerText: "B. Azure Functions",
    explanation: "Azure Functions is Azure's serverless compute offering. You write code that runs in response to events without provisioning or managing infrastructure.",
    confidence: "high",
  },

// ── Questions Q194–Q223 ────────────────────────────────────────────────────
  {
    id: 194,
    type: "multi",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "An Azure administrator plans to run a PowerShell script that creates Azure resources.\nYou need to recommend which computer configuration to use to run the script.\nWhich three computers can run the script? Each correct answer presents a complete solution.",
    options: [
      "A. a computer that runs macOS and has PowerShell Core 6.0 installed.",
      "B. a computer that runs Windows 10 and has the Azure PowerShell module installed.",
      "C. a computer that runs Linux and has the Azure PowerShell module installed.",
      "D. a computer that runs Linux and has the Azure CLI tools installed.",
      "E. a computer that runs Chrome OS and uses Azure Cloud Shell."
    ],
    answer: ["B", "C", "E"],
    answerCount: 3,
    answerText: "B, C, and E",
    explanation: "Azure PowerShell (Az module) runs on Windows, macOS, and Linux. However: A is wrong because the question specifies 'PowerShell Core 6.0' on macOS — note the Az module requires PowerShell 5.1+ or PowerShell Core 6+, so macOS with PowerShell Core is valid (B/C/E are the intended answers per exam). B: Windows 10 + Az module ✓. C: Linux + Az module ✓. E: Azure Cloud Shell provides PowerShell in browser on any OS ✓. D: Azure CLI is a different tool from PowerShell scripts.",
    confidence: "high",
  },
  {
    id: 195,
    type: "yesno",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You have an Azure subscription named Subscription1. You sign in to the Azure portal and create a resource group named RG1.\nFrom Azure documentation, you have the following command that creates a virtual machine named VM1:\naz vm create --resource-group RG1 --name VM1 --image UbuntuLTS --generate-ssh-keys\nYou need to create VM1 in Subscription1 by using the command.\nSolution: From the Azure portal, launch Azure Cloud Shell and select Bash. Run the command in Cloud Shell.\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Azure Cloud Shell (Bash) has the Azure CLI pre-installed. Running 'az vm create' in Cloud Shell Bash is a fully supported way to create the VM. The command is an Azure CLI command, not PowerShell, so Bash mode is correct.",
    confidence: "medium",
  },
  {
    id: 196,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "Your company has several business units. Each business unit requires 20 different Azure resources for daily operation. All the business units require the same type of Azure resources.\nYou need to recommend a solution to automate the creation of the Azure resources.\nWhat should you include in the recommendations?",
    options: [
      "A. Azure Resource Manager templates",
      "B. virtual machine scale sets",
      "C. the Azure API Management service",
      "D. management groups"
    ],
    answer: "A",
    answerText: "A. Azure Resource Manager templates",
    explanation: "Azure Resource Manager (ARM) templates allow you to define infrastructure as code in JSON/Bicep. You can deploy the same set of 20 resources consistently across multiple business units using a single template, enabling automation and repeatability.",
    confidence: "high",
  },
  {
    id: 197,
    type: "hotspot",
    topic: "AzureCostManagement",
    topicLabel: "Azure Cost Management & SLAs",
    question: "HOTSPOT — For each of the following statements about Azure Cost Management, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You can use Azure Cost Management to view costs associated to management groups.", answer: "Yes" },
      { text: "You can use Azure Cost Management to view costs associated to resource groups.", answer: "Yes" },
      { text: "You can use Azure Cost Management to view the usage of virtual machines during the last three months.", answer: "Yes" },
    ],
    explanation: "Azure Cost Management supports cost analysis at multiple scopes: management groups, subscriptions, resource groups, and resources. It also allows you to view usage history and trends over time, including VM usage over the past months.",
    confidence: "high",
  },
  {
    id: 198,
    type: "single",
    topic: "AzureCostManagement",
    topicLabel: "Azure Cost Management & SLAs",
    question: "What can you use to identify underutilized or unused Azure virtual machines?",
    options: [
      "A. Azure Advisor",
      "B. Azure Cost Management + Billing",
      "C. Azure reservations",
      "D. Azure Policy"
    ],
    answer: "A",
    answerText: "A. Azure Advisor",
    explanation: "Azure Advisor analyzes your resource configurations and usage telemetry and provides recommendations to optimize cost, performance, security, and reliability. Its 'Cost' category specifically identifies underutilized or idle VMs and recommends right-sizing or shutdown.",
    confidence: "high",
  },
  {
    id: 201,
    type: "hotspot",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — For each of the following statements about managing cloud services, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You must have internet connectivity to manage cloud services.", answer: "Yes" },
      { text: "You must install a management app to manage cloud services.", answer: "No" },
      { text: "You can manage cloud services from any modern web browser.", answer: "Yes" },
    ],
    explanation: "Yes: Internet connectivity is required to access and manage cloud services. No: You do NOT need a dedicated management app — the Azure portal is accessible from any browser. Yes: The Azure portal is a web-based interface accessible from any modern browser on any OS.",
    confidence: "high",
  },
  {
    id: 202,
    type: "matching",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "DRAG DROP — Match each Azure service to its correct description. (Each service may be used only once.)",
    pairs: [
      { left: "Azure Databricks", right: "A big data analysis service for machine learning" },
      { left: "Azure Functions", right: "Provides the platform for serverless code" },
      { left: "Azure App Service", right: "Hosts web apps" },
      { left: "Azure Application Insights", right: "Detects and diagnoses anomalies in web apps" },
    ],
    explanation: "Azure Databricks = big data analytics platform using Apache Spark with ML capabilities. Azure Functions = serverless compute platform for event-driven code. Azure App Service = fully managed PaaS for hosting web apps, REST APIs, and mobile backends. Azure Application Insights = APM service that monitors and detects performance issues and anomalies in web apps.",
    confidence: "high",
  },
  {
    id: 203,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "A team of developers at your company plans to deploy, and then remove, 50 customized virtual machines each week. Thirty of the virtual machines run Windows Server 2016 and 20 of the virtual machines run Ubuntu Linux.\nYou need to recommend which Azure service will minimize the administrative effort required to deploy and remove the virtual machines.\nWhat should you recommend?",
    options: [
      "A. Azure Reserved Virtual Machines (VM) Instances",
      "B. Azure virtual machine scale sets",
      "C. Azure DevTest Labs",
      "D. Microsoft Managed Desktop"
    ],
    answer: "C",
    answerText: "C. Azure DevTest Labs",
    explanation: "Azure DevTest Labs is designed for creating lab environments quickly and cost-effectively. It provides self-service VMs using reusable templates, automatic shutdown, and easy provisioning/deprovisioning — ideal for deploying and removing many VMs on a regular schedule with minimal admin effort.",
    confidence: "high",
  },
  {
    id: 204,
    type: "hotspot",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — For each of the following statements about Azure PowerShell and Azure Cloud Shell, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure PowerShell modules can be installed on macOS.", answer: "Yes" },
      { text: "Azure Cloud Shell can be accessed from a web browser on a Linux computer.", answer: "Yes" },
      { text: "The Azure portal can only be accessed from a Windows device.", answer: "No" },
    ],
    explanation: "Yes: The Azure PowerShell Az module is cross-platform — it runs on Windows, macOS, and Linux via PowerShell Core. Yes: Azure Cloud Shell is browser-based and accessible from any OS with a modern browser. No: The Azure portal is web-based and accessible from any device/OS with a browser.",
    confidence: "high",
  },
  {
    id: 205,
    type: "multi",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "A support engineer plans to perform several Azure management tasks by using the Azure CLI.\nYou install the CLI on a computer.\nYou need to tell the support engineer which tools to use to run the CLI.\nWhich two tools should you instruct the support engineer to use? Each correct answer presents a complete solution.",
    options: [
      "A. Command Prompt",
      "B. Azure Resource Explorer",
      "C. Windows PowerShell",
      "D. Windows Defender Firewall",
      "E. Network and Sharing Center"
    ],
    answer: ["A", "C"],
    answerCount: 2,
    answerText: "A and C",
    explanation: "The Azure CLI is a command-line tool that can be invoked from any shell. On Windows, both Command Prompt (cmd.exe) and Windows PowerShell are valid terminals for running 'az' commands. Azure Resource Explorer, Windows Defender Firewall, and Network and Sharing Center are not command-line shells.",
    confidence: "high",
  },
  {
    id: 206,
    type: "yesno",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You have an Azure environment. You need to create a new Azure virtual machine from a tablet that runs the Android operating system.\nSolution: You use PowerShell in Azure Cloud Shell.\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Azure Cloud Shell is accessible from any modern web browser, including browsers on Android tablets. Cloud Shell provides both Bash and PowerShell environments with all Azure tools pre-installed. You can create VMs using Azure PowerShell cmdlets or Azure CLI commands from Cloud Shell on any device.",
    confidence: "high",
  },
  {
    id: 207,
    type: "yesno",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You have an Azure environment. You need to create a new Azure virtual machine from a tablet that runs the Android operating system.\nSolution: You use the PowerApps portal.\nDoes this meet the goal?",
    answer: "No",
    explanation: "PowerApps (Microsoft Power Platform) is used for building business apps — it is NOT a tool for creating Azure virtual machines. To create Azure VMs you would use the Azure portal, Azure CLI, Azure PowerShell, ARM templates, or Azure Cloud Shell.",
    confidence: "high",
  },
  {
    id: 208,
    type: "yesno",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You have an Azure environment. You need to create a new Azure virtual machine from a tablet that runs the Android operating system.\nSolution: You use the Azure portal.\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "The Azure portal is a web-based graphical interface accessible from any modern web browser, including browsers on Android tablets. You can create and manage Azure virtual machines through the portal's GUI without any OS restrictions.",
    confidence: "high",
  },
  {
    id: 209,
    type: "dropdown",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { blank: "BLANK1", options: ["The Microsoft 365 Compliance admin center", "The Microsoft 365 Defender portal", "Microsoft Defender for Cloud in the Azure portal", "Microsoft Trust Center"], answer: "Microsoft Trust Center" },
      { text: " provides in-depth information about security, privacy, compliance offerings, policies, and features across Microsoft cloud products." },
    ],
    explanation: "Microsoft Trust Center is the central hub for Microsoft's security, privacy, compliance, and transparency information. It provides detailed documentation on how Microsoft protects data, complies with regulations (GDPR, ISO, SOC, etc.), and maintains privacy across all cloud services.",
    confidence: "high",
  },
  {
    id: 210,
    type: "dropdown",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "You can manage an on-premises Windows server as an Azure resource by using " },
      { blank: "BLANK1", options: ["Azure AD Connect", "Azure Arc", "an Azure Pipelines agent", "Azure VPN Gateway"], answer: "Azure Arc" },
      { text: "." },
    ],
    explanation: "Azure Arc extends Azure management capabilities to on-premises servers, VMs, and Kubernetes clusters. By installing the Azure Arc agent on an on-premises Windows or Linux server, it appears as an Azure resource in the portal, enabling you to apply Azure Policy, manage tags, use Defender for Cloud, and more.",
    confidence: "high",
  },
  {
    id: 211,
    type: "hotspot",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — For each of the following statements about managing cloud services, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You can only manage cloud services from Windows devices.", answer: "No" },
      { text: "You can manage cloud services from the command line.", answer: "Yes" },
      { text: "You can manage cloud services by using a web browser.", answer: "Yes" },
    ],
    explanation: "No: Azure can be managed from Windows, macOS, Linux, iOS, and Android — there is no Windows requirement. Yes: Azure CLI and Azure PowerShell provide full command-line management from any terminal. Yes: The Azure portal is a web-based interface accessible from any browser.",
    confidence: "high",
  },
  {
    id: 212,
    type: "dropdown",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { blank: "BLANK1", options: ["Azure Databricks", "Azure Data Factory", "Azure DevOps", "Azure Synapse Analytics"], answer: "Azure Databricks" },
      { text: " is an Apache Spark-based analytics service." },
    ],
    explanation: "Azure Databricks is built on Apache Spark and provides a collaborative analytics platform for big data and machine learning workloads. It integrates with Azure storage services, Azure ML, and supports Python, R, Scala, and SQL.",
    confidence: "high",
  },
  {
    id: 213,
    type: "hotspot",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — For each of the following statements about Azure Monitor, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Monitor can monitor the performance of on-premises computers.", answer: "Yes" },
      { text: "Azure Monitor can send alerts to Azure Active Directory security groups.", answer: "Yes" },
      { text: "Azure Monitor can trigger alerts based on data in an Azure Log Analytics workspace.", answer: "Yes" },
    ],
    explanation: "Yes: Azure Monitor with the Azure Monitor Agent can collect performance data from on-premises servers, not just Azure resources. Yes: Azure Monitor alert action groups can send notifications to email addresses, including AAD group emails, and call webhooks. Yes: Log Analytics workspace queries (Kusto/KQL) can be used as alert conditions in Azure Monitor.",
    confidence: "high",
  },
  {
    id: 214,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "Which Azure service provides a set of version control tools to manage code?",
    options: [
      "A. Azure Repos",
      "B. Azure DevTest Labs",
      "C. Azure Storage",
      "D. Azure Cosmos DB"
    ],
    answer: "A",
    answerText: "A. Azure Repos",
    explanation: "Azure Repos (part of Azure DevOps) provides Git-based and TFVC (Team Foundation Version Control) repositories for version control and code management. It enables branching, pull requests, and code reviews.",
    confidence: "high",
  },
  {
    id: 216,
    type: "single",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "You have a virtual machine named VM1 that runs Windows Server 2016. VM1 is in the East US Azure region.\nWhich Azure service should you use from the Azure portal to view service failure notifications that can affect the availability of VM1?",
    options: [
      "A. Azure Service Fabric",
      "B. Azure Monitor",
      "C. Azure virtual machines",
      "D. Azure Advisor"
    ],
    answer: "B",
    answerText: "B. Azure Monitor",
    explanation: "Azure Monitor (via Service Health) provides notifications about Azure service outages, planned maintenance, and health advisories that can affect your resources. You can configure alerts and view the Service Health dashboard to see incidents affecting the East US region and your VM.",
    confidence: "medium",
  },
  {
    id: 217,
    type: "yesno",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "Your Azure environment contains multiple Azure virtual machines.\nYou need to ensure that a virtual machine named VM1 is accessible from the Internet over HTTP.\nSolution: You modify an Azure Traffic Manager profile.\nDoes this meet the goal?",
    answer: "No",
    explanation: "Azure Traffic Manager is a DNS-based traffic load balancer that distributes traffic across global Azure endpoints — it does NOT control inbound HTTP access to individual VMs. To make VM1 accessible over HTTP you need to configure a Network Security Group (NSG) to allow port 80, ensure VM1 has a public IP, and optionally use a load balancer or Application Gateway.",
    confidence: "high",
  },
  {
    id: 218,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "Your company plans to deploy several web servers and several database servers to Azure.\nYou need to recommend an Azure solution to limit the types of connections from the web servers to the database servers.\nWhat should you include in the recommendation?",
    options: [
      "A. network security groups (NSGs)",
      "B. Azure Service Bus",
      "C. a local network gateway",
      "D. a route filter"
    ],
    answer: "A",
    answerText: "A. network security groups (NSGs)",
    explanation: "Network Security Groups (NSGs) contain security rules that allow or deny inbound and outbound traffic based on source/destination IP, port, and protocol. They are the standard Azure mechanism to restrict which connection types are permitted between tiers (e.g., only allow port 1433 from web servers to SQL servers).",
    confidence: "high",
  },
  {
    id: 219,
    type: "dropdown",
    topic: "AzureServices",
    topicLabel: "Azure Core Services",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "From " },
      { blank: "BLANK1", options: ["Azure Access Control IAM", "Azure Event Hubs", "Azure Activity Log", "Azure Service Health"], answer: "Azure Activity Log" },
      { text: " you can view which user turned off a specific virtual machine during the last 14 days." },
    ],
    explanation: "Azure Activity Log records all control-plane operations performed on Azure resources, including who started or stopped a VM. Logs are retained for 90 days. You can filter by operation type (e.g., 'Deallocate Virtual Machine') and time range to identify which user performed the action.",
    confidence: "high",
  },
  {
    id: 220,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "Which service provides network traffic filtering across multiple Azure subscriptions and virtual networks?",
    options: [
      "A. Azure Firewall",
      "B. an application security group",
      "C. Azure DDoS protection",
      "D. a network security group (NSG)"
    ],
    answer: "A",
    answerText: "A. Azure Firewall",
    explanation: "Azure Firewall is a managed, cloud-based network security service that can centrally enforce application and network connectivity policies across multiple subscriptions and virtual networks using a hub-spoke model. NSGs are scoped to a single subnet or NIC and cannot span subscriptions.",
    confidence: "high",
  },
  {
    id: 221,
    type: "single",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "Which Azure service should you use to store certificates?",
    options: [
      "A. Azure Security Center",
      "B. an Azure Storage account",
      "C. Azure Key Vault",
      "D. Azure Information Protection"
    ],
    answer: "C",
    answerText: "C. Azure Key Vault",
    explanation: "Azure Key Vault is specifically designed to securely store and manage cryptographic keys, secrets (passwords, connection strings), and certificates. It provides hardware security module (HSM) protection, access policies, and audit logging.",
    confidence: "high",
  },
  {
    id: 222,
    type: "single",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "Which Azure service can you use as a security information and event management (SIEM) solution?",
    options: [
      "A. Azure Analysis Services",
      "B. Azure Sentinel",
      "C. Azure Information Protection",
      "D. Azure Cognitive Services"
    ],
    answer: "B",
    answerText: "B. Azure Sentinel",
    explanation: "Microsoft Sentinel (formerly Azure Sentinel) is Azure's cloud-native SIEM and SOAR (Security Orchestration, Automation, and Response) solution. It collects security data from multiple sources, uses AI to detect threats, and uses playbooks (Logic Apps) to respond automatically.",
    confidence: "high",
  },
  {
    id: 223,
    type: "hotspot",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each of the following statements about Azure Sentinel, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Sentinel stores collected events in an Azure Storage account.", answer: "No" },
      { text: "Azure Sentinel can remediate incidents automatically.", answer: "Yes" },
      { text: "Azure Sentinel can collect Windows Defender Firewall logs from Azure virtual machines.", answer: "Yes" },
    ],
    explanation: "No: Microsoft Sentinel stores its data in a Log Analytics workspace (not Azure Storage directly). Yes: Sentinel supports SOAR capabilities using playbooks (Azure Logic Apps) to automatically remediate incidents. Yes: Sentinel can collect Windows Defender Firewall and Security events from Azure VMs using the Log Analytics agent or Azure Monitor Agent.",
    confidence: "high",
  },

  // ── Q224–Q238 ──────────────────────────────────────────────────────────────
  {
    id: 224,
    type: "matching",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "DRAG DROP — Match each Azure service to its correct description. (Each service may be used only once.)",
    pairs: [
      { left: "Azure Sentinel", right: "Provides security information event management (SIEM) functionality" },
      { left: "Azure Security Center", right: "Displays the secure score for an Azure subscription" },
      { left: "Azure Key Vault", right: "Stores passwords for use by Azure Function applications" },
    ],
    explanation: "Azure Sentinel = cloud-native SIEM/SOAR for collecting, detecting, and responding to security events. Azure Security Center (Defender for Cloud) = shows Secure Score and regulatory compliance. Azure Key Vault = stores secrets, keys, and certificates used by applications.",
    confidence: "high",
  },
  {
    id: 225,
    type: "hotspot",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "HOTSPOT — For each of the following statements about network encryption, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Firewall will encrypt all the network traffic sent from Azure to the Internet.", answer: "No" },
      { text: "A network security group (NSG) will encrypt all the network traffic sent from Azure to the Internet.", answer: "No" },
      { text: "Azure virtual machines that run Windows Server 2016 can encrypt network traffic sent to the Internet.", answer: "Yes" },
    ],
    explanation: "No: Azure Firewall filters and logs traffic but does NOT encrypt it — it is a stateful firewall, not a VPN or encryption service. No: NSGs are packet filters (allow/deny rules) — they do not encrypt traffic. Yes: Windows Server 2016 supports IPsec, which can encrypt outbound network traffic to the internet.",
    confidence: "high",
  },
  {
    id: 226,
    type: "hotspot",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each of the following statements about Azure Security Center, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Security Center can monitor Azure resources and on-premises resources.", answer: "Yes" },
      { text: "All Azure Security Center features are free.", answer: "No" },
      { text: "From Azure Security Center, you can download a Regulatory Compliance report.", answer: "Yes" },
    ],
    explanation: "Yes: Microsoft Defender for Cloud (formerly Security Center) can monitor Azure, on-premises, and multi-cloud resources via Azure Arc. No: Basic features are free but enhanced security (Defender plans) requires paid tier. Yes: The Regulatory Compliance dashboard in Defender for Cloud lets you download compliance reports (SOC, ISO, PCI-DSS, etc.).",
    confidence: "high",
  },
  {
    id: 227,
    type: "matching",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "DRAG DROP — You need to complete the defense-in-depth strategy. Match each layer to its correct position in the model.",
    pairs: [
      { left: "Physical Security", right: "The outermost layer protecting physical datacenter access" },
      { left: "Perimeter", right: "Uses DDoS protection and firewalls to defend against network-based attacks" },
      { left: "Application", right: "Ensures applications are secure and free of vulnerabilities" },
    ],
    explanation: "Defense-in-depth layers from outer to inner: Physical Security → Identity & Access → Perimeter (DDoS/Firewall) → Network (NSGs) → Compute (endpoint protection) → Application (secure coding) → Data (encryption). Physical Security is outermost; Data is innermost.",
    confidence: "high",
  },
  {
    id: 228,
    type: "single",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "You have an Azure virtual machine named VM1.\nYou plan to encrypt VM1 by using Azure Disk Encryption.\nWhich Azure resource must you create first?",
    options: [
      "A. an Azure Storage account",
      "B. an Azure Key Vault",
      "C. an Azure Information Protection policy",
      "D. an Encryption key"
    ],
    answer: "B",
    answerText: "B. an Azure Key Vault",
    explanation: "Azure Disk Encryption requires an Azure Key Vault to store the disk encryption keys (BitLocker keys for Windows, DM-Crypt keys for Linux). The Key Vault must be created and configured before enabling disk encryption on the VM.",
    confidence: "high",
  },
  {
    id: 229,
    type: "single",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "Which resources can be used as a source for a Network security group inbound security rule?",
    options: [
      "A. Service Tags only",
      "B. IP Addresses, Service tags and Application security groups",
      "C. Application security groups only",
      "D. IP Addresses only"
    ],
    answer: "B",
    answerText: "B. IP Addresses, Service tags and Application security groups",
    explanation: "NSG security rules support three types of source/destination: (1) IP address or CIDR range, (2) Service Tags (e.g., Internet, AzureCloud, Storage), and (3) Application Security Groups (ASGs) for grouping VMs by role. All three can be used as the source in an inbound rule.",
    confidence: "medium",
  },
  {
    id: 230,
    type: "dropdown",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Azure Sentinel uses playbooks to " },
      { blank: "BLANK1", options: ["automatically respond to threats.", "collect data from Azure services.", "specify how long data is retained.", "store passwords and certificates."], answer: "automatically respond to threats." },
    ],
    explanation: "Azure Sentinel (Microsoft Sentinel) uses playbooks — built on Azure Logic Apps — to automatically respond to detected threats and incidents. Playbooks can isolate VMs, send notifications, create tickets, or run remediation actions automatically.",
    confidence: "high",
  },
  {
    id: 231,
    type: "dropdown",
    topic: "AzureNetworking",
    topicLabel: "Azure Networking",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { blank: "BLANK1", options: ["Application rules", "Network Address Translation (NAT) rules", "Network rules", "Service tags"], answer: "Network Address Translation (NAT) rules" },
      { text: " in Azure Firewall enables users on the internet to access a server on a virtual network." },
    ],
    explanation: "Azure Firewall DNAT (Destination NAT) rules translate inbound internet traffic to internal private IP addresses, allowing external users to reach internal servers. Application rules control outbound HTTP/S access; network rules control non-HTTP traffic.",
    confidence: "high",
  },
  {
    id: 232,
    type: "dropdown",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Azure distributed denial of service (DDoS) protection is an example of protection that is implemented at the " },
      { blank: "BLANK1", options: ["application layer.", "compute layer.", "networking layer.", "perimeter layer."], answer: "perimeter layer." },
    ],
    explanation: "In the defense-in-depth model, DDoS protection is implemented at the Perimeter layer — the outermost security boundary between the internet and your internal network. The perimeter layer uses firewalls, DDoS protection, and intrusion detection to block large-scale attacks before they reach internal resources.",
    confidence: "high",
  },
  {
    id: 233,
    type: "single",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "You have an Azure Sentinel workspace.\nYou need to automate responses to threats detected by Azure Sentinel.\nWhat should you use?",
    options: [
      "A. adaptive network hardening in Azure Security Center",
      "B. Azure Service Health",
      "C. Azure Monitor workbooks",
      "D. adaptive application controls in Azure Security Center"
    ],
    answer: "C",
    answerText: "C. Azure Monitor workbooks",
    explanation: "Per the official exam answer: Azure Monitor workbooks provide interactive reports and can be used to visualize and act on Sentinel data. However, note that in practice, the primary automated response tool in Sentinel is Playbooks (Logic Apps). Azure Monitor workbooks are used for data visualization and analysis. This question is flagged as potentially outdated.",
    confidence: "medium",
  },
  {
    id: 234,
    type: "matching",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "DRAG DROP — Match each Azure service to its correct description. (Each service may be used only once.)",
    pairs: [
      { left: "Microsoft Sentinel", right: "Provides security information event management (SIEM) functionality" },
      { left: "Microsoft Defender for Cloud", right: "Displays the secure score for an Azure subscription" },
      { left: "Azure Key Vault", right: "Stores passwords for use by Azure Function applications" },
    ],
    explanation: "Microsoft Sentinel = SIEM/SOAR solution for threat detection and response. Microsoft Defender for Cloud = provides Secure Score, security recommendations, and compliance. Azure Key Vault = secure storage for secrets, keys, certificates used by applications.",
    confidence: "high",
  },
  {
    id: 235,
    type: "single",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "Which Azure service can you use as a security information and event management (SIEM) solution?",
    options: [
      "A. Azure Analysis Services",
      "B. Microsoft Sentinel",
      "C. Azure Information Protection",
      "D. Azure Cognitive Services"
    ],
    answer: "B",
    answerText: "B. Microsoft Sentinel",
    explanation: "Microsoft Sentinel (formerly Azure Sentinel) is Azure's cloud-native SIEM and SOAR solution. It aggregates security data from across the enterprise, uses AI to detect threats, and provides automated incident response via playbooks.",
    confidence: "high",
  },
  {
    id: 236,
    type: "dropdown",
    topic: "AzureGovernance",
    topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "An Azure Policy initiative definition is a " },
      { blank: "BLANK1", options: ["collection of policy definitions.", "collection of Azure Policy definition assignments.", "group of Azure Blueprints definitions.", "group of role-based access control (RBAC) role assignments."], answer: "collection of policy definitions." },
    ],
    explanation: "An Azure Policy initiative is a collection (set) of Azure Policy definitions grouped together to achieve a broader compliance goal. For example, the 'Enable Monitoring in Azure Security Center' initiative groups dozens of individual policy definitions.",
    confidence: "high",
  },
  {
    id: 237,
    type: "single",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "You have an Azure subscription.\nYou need to review your secure score.\nWhat should you use?",
    options: [
      "A. Azure Monitor",
      "B. Azure Advisor",
      "C. Help + support",
      "D. Microsoft Defender for Cloud"
    ],
    answer: "D",
    answerText: "D. Microsoft Defender for Cloud",
    explanation: "Microsoft Defender for Cloud (formerly Azure Security Center) provides the Secure Score feature, which quantifies your security posture based on implemented security controls. A higher score means a stronger security posture.",
    confidence: "high",
  },
  {
    id: 238,
    type: "dropdown",
    topic: "AzureIdentity",
    topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "You can enable just in time (JIT) VM access by using " },
      { blank: "BLANK1", options: ["Azure Bastion", "Azure Firewall", "Azure Front Door", "Microsoft Defender for Cloud"], answer: "Microsoft Defender for Cloud" },
      { text: "." },
    ],
    explanation: "Just-in-time (JIT) VM access is a feature of Microsoft Defender for Cloud that locks down inbound traffic to VMs. When access is needed, Defender for Cloud opens a temporary NSG rule for the approved port/IP/duration, reducing exposure to brute-force attacks.",
    confidence: "high",
  },

  { id: 239, type: "dropdown", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "You can view your company's regulatory compliance report from " },
      { blank: "BLANK1", options: ["Azure Advisor","Azure Analysis Services","Azure Monitor","Microsoft Defender for Cloud"], answer: "Microsoft Defender for Cloud" },
      { text: "." }
    ],
    explanation: "Microsoft Defender for Cloud includes a regulatory compliance dashboard where you can view your compliance status against standards like ISO 27001, PCI DSS, and others. You can download PDF/CSV reports as well as certification reports of your compliance status.",
    confidence: "high" },

  { id: 240, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to collect and automatically analyze security events from Azure Active Directory (Azure AD). What should you use?",
    options: ["A. Microsoft Sentinel","B. Azure Synapse Analytics","C. Azure AD Connect","D. Azure Key Vault"],
    answer: "A", answerText: "A. Microsoft Sentinel",
    explanation: "Microsoft Sentinel is a cloud-native SIEM (Security Information and Event Management) and SOAR solution. It can collect and automatically analyze security events from Azure AD and other sources, detecting threats and responding to them.",
    confidence: "high" },

  { id: 241, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "Which Azure service should you use to enable single sign-on (SSO) for enterprise applications?",
    options: ["A. Azure Active Directory (Azure AD)","B. Azure Key Vault","C. Azure Firewall","D. Microsoft Defender for Cloud"],
    answer: "A", answerText: "A. Azure Active Directory (Azure AD)",
    explanation: "Azure Active Directory (Azure AD) provides single sign-on (SSO) capabilities for enterprise applications. With Azure AD SSO, users can sign in once and access multiple applications without re-entering credentials.",
    confidence: "high" },

  { id: 242, type: "hotspot", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each of the following statements about Network Security Groups (NSGs), select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "When you create an NSG, all inbound and outbound traffic is blocked by default.", answer: "No" },
      { text: "NSG rules can reference application security groups.", answer: "Yes" },
      { text: "Azure creates default inbound and outbound rules in every NSG.", answer: "Yes" },
    ],
    explanation: "When you create an NSG, Azure creates default rules that ALLOW some traffic (e.g., VNet-to-VNet and Azure Load Balancer). NSG rules can reference application security groups (ASGs), which simplify security management. Azure creates both default inbound and outbound rules in every NSG automatically.",
    confidence: "high" },

  { id: 244, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You plan to implement a server deployment automation solution. You need to ensure that administrative credentials used during deployment are encrypted and protected. What should you use?",
    options: ["A. Azure Key Vault","B. Azure Information Protection","C. Microsoft Defender for Cloud","D. Azure MFA"],
    answer: "A", answerText: "A. Azure Key Vault",
    explanation: "Azure Key Vault is designed to securely store and manage secrets, keys, and certificates. Storing administrative credentials in Azure Key Vault ensures they are encrypted at rest and access is tightly controlled, making it ideal for automation scenarios.",
    confidence: "high" },

  { id: 245, type: "dropdown", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "To filter network traffic to and from Azure resources in an Azure virtual network, you use " },
      { blank: "BLANK1", options: ["Azure Firewall","Azure DDoS Protection","a network security group (NSG)","Azure Bastion"], answer: "a network security group (NSG)" },
      { text: "." }
    ],
    explanation: "A Network Security Group (NSG) contains security rules that allow or deny inbound or outbound network traffic to/from Azure resources in an Azure virtual network. NSGs act as a basic stateful firewall for Azure resources.",
    confidence: "high" },

  { id: 247, type: "dropdown", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "To automatically respond to threats using Microsoft Sentinel, you use " },
      { blank: "BLANK1", options: ["Workbooks","Playbooks","Connectors","Incidents"], answer: "Playbooks" },
      { text: "." }
    ],
    explanation: "In Microsoft Sentinel, playbooks are collections of procedures that can run in response to an alert or incident. They are built on Azure Logic Apps and can automate responses to threats, such as isolating a compromised VM or sending notifications.",
    confidence: "high" },

  { id: 248, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "Your company needs a solution to secure websites from attacks and generate detailed reports of attempted attacks. What should you use?",
    options: ["A. Azure Firewall","B. network security group (NSG)","C. Azure Information Protection","D. DDoS protection"],
    answer: "D", answerText: "D. DDoS protection",
    explanation: "Azure DDoS Protection defends against Distributed Denial of Service attacks and provides attack telemetry and analytics. It generates detailed reports of attempted DDoS attacks, providing visibility into attack patterns and helping secure web applications.",
    confidence: "high" },

  { id: 249, type: "hotspot", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the correct Azure service for each requirement.",
    statements: [
      { text: "Monitor threats by deploying sensors that capture and parse network traffic.", answer: "Azure Advanced Threat Protection (ATP)" },
      { text: "Enforce multi-factor authentication (MFA) based on a condition such as risk level.", answer: "Azure AD Identity Protection" },
    ],
    explanation: "Azure Advanced Threat Protection (Microsoft Defender for Identity) uses sensors to capture and analyze network traffic to detect threats. Azure AD Identity Protection detects risky sign-ins and can enforce MFA based on conditions such as sign-in risk level or user risk level.",
    confidence: "high" },

  { id: 250, type: "multi", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You have a virtual machine named VM1. You need to ensure that VM1 is accessible from the Internet over HTTP. Which two solutions can you use? Each correct answer presents a complete solution.",
    options: ["A. Modify Azure Traffic Manager profile","B. Modify the network security group (NSG)","C. Modify the DDoS protection plan","D. Modify Azure firewall"],
    answer: ["B","D"], answerText: "B. Modify the network security group (NSG), D. Modify Azure firewall",
    explanation: "To allow HTTP traffic to a VM: (B) Modifying the NSG to allow port 80 inbound traffic will allow HTTP access. (D) Azure Firewall can also be configured to allow HTTP traffic to the VM. Traffic Manager profiles and DDoS protection plans do not control port-level access.",
    confidence: "high" },

  { id: 251, type: "dropdown", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "To lock down inbound traffic to Azure virtual machines while still providing easy access when needed, you use " },
      { blank: "BLANK1", options: ["Azure Bastion","Just-in-time (JIT) VM access","Azure Firewall","NSG flow logs"], answer: "Just-in-time (JIT) VM access" },
      { text: "." }
    ],
    explanation: "Just-in-time (JIT) VM access in Microsoft Defender for Cloud locks down inbound traffic to VMs by closing management ports when not in use. When access is needed, it opens ports for a limited time from specific IP addresses, reducing exposure to attacks.",
    confidence: "high" },

  { id: 253, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You have 10 Azure virtual networks and 100 virtual machines. You need to limit the amount of inbound traffic to all 10 virtual networks. What is the minimum number of resources you need?",
    options: ["A. one application security group (ASG)","B. 10 virtual network gateways","C. 10 Azure ExpressRoute circuits","D. one Azure firewall"],
    answer: "D", answerText: "D. one Azure firewall",
    explanation: "A single Azure Firewall can be deployed in a hub virtual network and used to filter traffic across multiple spoke virtual networks via virtual network peering. One Azure Firewall in a hub-and-spoke architecture can protect all 10 virtual networks.",
    confidence: "high" },

  { id: 254, type: "dropdown", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Azure Key Vault is used to store secrets for " },
      { blank: "BLANK1", options: ["No change is needed","Azure AD administrative accounts","Personally Identifiable Information (PII)","server applications"], answer: "server applications" },
      { text: "." }
    ],
    explanation: "Azure Key Vault is designed to store secrets, keys, and certificates used by applications and services, including server applications. It enables secure storage and access of credentials, API keys, connection strings, and other secrets that applications need.",
    confidence: "high" },

  { id: 255, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You plan to deploy several servers to Azure. You need to ensure that administrative credentials used during server deployment are encrypted. What should you use?",
    options: ["A. Azure Key Vault","B. Azure Information Protection","C. Azure Security Center","D. Azure MFA"],
    answer: "A", answerText: "A. Azure Key Vault",
    explanation: "Azure Key Vault securely stores and manages secrets, keys, and certificates. Storing administrative credentials in Azure Key Vault during server deployment ensures they are encrypted and access is controlled with proper auditing.",
    confidence: "high" },

  { id: 256, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to control which ports Internet devices can use to connect to Azure virtual machines. What should you use?",
    options: ["A. network security group (NSG)","B. Azure AD role","C. Azure AD group","D. Azure Key Vault"],
    answer: "A", answerText: "A. network security group (NSG)",
    explanation: "A Network Security Group (NSG) contains security rules that control inbound and outbound network traffic to Azure resources. NSG rules specify source/destination, protocol, and port ranges, making them the correct tool to control which ports Internet devices can use to connect to VMs.",
    confidence: "high" },

  { id: 257, type: "dropdown", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "To allow connections to a virtual machine on port 8080, you should " },
      { blank: "BLANK1", options: ["add a rule to the NSG attached to the VM's network interface","configure Azure Firewall","enable Azure DDoS Protection","create an Azure Policy"], answer: "add a rule to the NSG attached to the VM's network interface" },
      { text: "." }
    ],
    explanation: "To allow inbound connections to a VM on port 8080, you add an inbound security rule to the Network Security Group (NSG) associated with the VM's network interface or subnet, specifying port 8080 as the destination port.",
    confidence: "high" },

  { id: 259, type: "yesno", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to ensure that VM1 is accessible from the Internet over HTTP.\n\nProposed solution: Modify a network security group (NSG).\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Modifying an NSG to add an inbound rule allowing port 80 (HTTP) will make VM1 accessible from the Internet over HTTP. This meets the goal.",
    confidence: "high" },

  { id: 260, type: "yesno", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to ensure that VM1 is accessible from the Internet over HTTP.\n\nProposed solution: Modify a DDoS protection plan.\n\nDoes this meet the goal?",
    answer: "No",
    explanation: "DDoS Protection protects against distributed denial-of-service attacks but does not control which ports are open or allow/block traffic. Modifying a DDoS protection plan will not make VM1 accessible over HTTP.",
    confidence: "high" },

  { id: 261, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to collect and automatically analyze security events from Azure Active Directory (Azure AD). What should you use?",
    options: ["A. Azure Sentinel","B. Azure Synapse Analytics","C. Azure AD Connect","D. Azure Key Vault"],
    answer: "A", answerText: "A. Azure Sentinel",
    explanation: "Azure Sentinel (Microsoft Sentinel) is a cloud-native SIEM and SOAR solution that can collect and analyze security events from Azure AD and many other sources to detect and respond to threats.",
    confidence: "high" },

  { id: 262, type: "yesno", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to ensure that VM1 is accessible from the Internet over HTTP.\n\nProposed solution: Modify an Azure firewall.\n\nDoes this meet the goal?",
    answer: "No",
    explanation: "While Azure Firewall can control traffic, simply modifying an Azure Firewall configuration alone is not sufficient — you still need the NSG to allow the traffic. Azure Firewall typically works with NSGs together. Without modifying the NSG as well, this alone does not meet the goal.",
    confidence: "medium" },

  { id: 263, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Azure Germany can be used by " },
      { blank: "BLANK1", options: ["no change is needed","only enterprises registered in Germany","only enterprises purchasing licenses from a German partner","any user or enterprise that requires data to reside in Germany"], answer: "any user or enterprise that requires data to reside in Germany" },
      { text: "." }
    ],
    explanation: "Azure Germany is available to any customer or enterprise that requires their data to reside within Germany. It is not restricted to German-registered companies or those purchasing from a German partner. It was designed for customers with strict German data residency requirements.",
    confidence: "high" },

  { id: 264, type: "hotspot", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each of the following statements about Azure AD and on-premises directory integration, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure AD Connect can synchronize on-premises Active Directory accounts to Azure AD.", answer: "Yes" },
      { text: "Third-party cloud services can access Azure resources through federation with Azure AD.", answer: "Yes" },
      { text: "Azure AD is the primary authentication and authorization service for Azure resources.", answer: "Yes" },
    ],
    explanation: "Azure AD Connect synchronizes on-premises AD accounts to Azure AD. Through federation, third-party cloud services can access Azure via Azure AD. Azure AD is the identity platform and primary authentication/authorization service for all Azure resources.",
    confidence: "high" },

  { id: 265, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "To track compliance and governance over time, you should use " },
      { blank: "BLANK1", options: ["Azure Advisor","Azure Monitor","Azure Security Center","Azure Policy"], answer: "Azure Security Center" },
      { text: "." }
    ],
    explanation: "Azure Security Center (Microsoft Defender for Cloud) provides advanced monitoring for compliance and governance over time. It provides a secure score, compliance dashboards, and tracks your security posture against regulatory standards over time.",
    confidence: "high" },

  { id: 267, type: "dropdown", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "To automatically add a watermark to Word documents that contain credit card information, you should use " },
      { blank: "BLANK1", options: ["Azure Information Protection","Microsoft Defender for Cloud","Azure Sentinel","Azure Key Vault"], answer: "Azure Information Protection" },
      { text: "." }
    ],
    explanation: "Azure Information Protection (AIP) allows you to classify, label, and protect documents based on their content. You can configure policies to automatically apply visual markings (such as watermarks) to documents containing sensitive data like credit card numbers.",
    confidence: "high" },

  { id: 268, type: "hotspot", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each of the following statements about Azure Active Directory (Azure AD), select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure AD requires the deployment of domain controllers on Azure virtual machines.", answer: "No" },
      { text: "Azure AD is the primary authentication and authorization service for Azure and Microsoft 365.", answer: "Yes" },
      { text: "Each user account in Azure AD can only be assigned one license.", answer: "No" },
    ],
    explanation: "Azure AD is a cloud-based identity service that does NOT require domain controllers on VMs — it is managed by Microsoft. Azure AD is the primary auth/authorization for Azure and Microsoft 365. User accounts CAN be assigned multiple licenses in Azure AD.",
    confidence: "high" },

  { id: 269, type: "multi", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "Which two types of customers are eligible to use Azure Government? Each correct answer presents part of the solution.",
    options: ["A. Canadian government contractor","B. European government contractor","C. United States government entity","D. United States government contractor","E. European government entity"],
    answer: ["C","D"], answerText: "C. United States government entity, D. United States government contractor",
    explanation: "Azure Government is available only to US government entities and US government contractors. It is a dedicated cloud instance for the US public sector with additional compliance certifications and data residency in the United States.",
    confidence: "high" },

  { id: 270, type: "hotspot", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each of the following statements about Azure Multi-Factor Authentication (MFA), select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "To use Azure MFA, you must sync on-premises Active Directory accounts to Azure AD using federation.", answer: "No" },
      { text: "Physical items such as a driver's license or passport are valid Azure MFA verification methods.", answer: "No" },
      { text: "Azure MFA can be required for all users or restricted to administrators only.", answer: "Yes" },
    ],
    explanation: "Azure MFA can work with cloud-only accounts — federation is not required. Physical IDs like driver's licenses and passports are NOT valid MFA methods (valid methods include authenticator apps, SMS, phone calls, hardware tokens). MFA can be required for all users or only admins based on policy.",
    confidence: "high" },

  { id: 271, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to prompt users to change their passwords when the system detects that they are connecting from an anonymous IP address. What should you use?",
    options: ["A. Azure AD Connect Health","B. Azure AD Privileged Identity Management","C. Azure Advanced Threat Protection (ATP)","D. Azure AD Identity Protection"],
    answer: "D", answerText: "D. Azure AD Identity Protection",
    explanation: "Azure AD Identity Protection uses machine learning to detect risky sign-in conditions such as anonymous IP addresses, atypical travel, and malware-linked IP addresses. It can be configured to automatically prompt users to change their passwords or require MFA when risk is detected.",
    confidence: "high" },

  { id: 272, type: "matching", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "DRAG DROP — Match each term to its correct definition.",
    pairs: [
      { left: "ISO", right: "International Organization for Standardization — publishes international standards" },
      { left: "NIST", right: "National Institute of Standards and Technology — US agency that develops technology standards" },
      { left: "GDPR", right: "General Data Protection Regulation — EU regulation protecting personal data privacy" },
      { left: "Azure Government", right: "A dedicated Microsoft cloud for US government entities and contractors" },
    ],
    explanation: "ISO is the International Organization for Standardization. NIST is the National Institute of Standards and Technology (US). GDPR is the EU General Data Protection Regulation for data privacy. Azure Government is the dedicated US government cloud.",
    confidence: "high" },

  { id: 273, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You are developing an application that needs to retrieve security tokens for accessing Azure services. Which service should the application connect to?",
    options: ["A. Azure Storage account","B. Azure Active Directory (Azure AD)","C. a certificate store","D. Azure Key Vault"],
    answer: "B", answerText: "B. Azure Active Directory (Azure AD)",
    explanation: "Azure Active Directory (Azure AD) is the identity platform for Azure. Applications use Azure AD to authenticate and receive security tokens (such as OAuth 2.0 tokens or SAML assertions) that grant access to Azure services and other resources.",
    confidence: "high" },

  { id: 274, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to migrate 5,000 on-premises Active Directory user accounts to Azure. You want to minimize the impact on users. What should you do?",
    options: ["A. Implement Azure MFA","B. Sync all Active Directory accounts to Azure AD","C. Instruct users to change their passwords","D. Create guest user accounts in Azure AD"],
    answer: "B", answerText: "B. Sync all Active Directory accounts to Azure AD",
    explanation: "Using Azure AD Connect to synchronize on-premises Active Directory accounts to Azure AD minimizes impact on users — they can continue using their existing credentials (same username and password) to access both on-premises and cloud resources through seamless single sign-on.",
    confidence: "high" },

  { id: 275, type: "hotspot", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "HOTSPOT — For each of the following statements about Azure Monitor, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You can send Azure Active Directory activity logs to Azure Monitor.", answer: "Yes" },
      { text: "Azure Monitor can consolidate logs from multiple Azure subscriptions and tenants.", answer: "Yes" },
      { text: "You can create alerts based on metrics and logs in Azure Monitor.", answer: "Yes" },
    ],
    explanation: "Azure Monitor can receive Azure AD activity logs. It can consolidate logs across multiple resources, subscriptions, and tenants using Log Analytics workspaces. Azure Monitor supports creating alerts based on both metric values and log query results.",
    confidence: "high" },

  { id: 276, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "To prevent the accidental deletion of resources in a resource group named RG1, you should use the " },
      { blank: "BLANK1", options: ["Tags settings","Access control (IAM)","Locks setting","Policies"], answer: "Locks setting" },
      { text: "." }
    ],
    explanation: "Azure resource locks (the Locks setting) prevent accidental deletion or modification of resources. A CanNotDelete lock allows reads and modifications but prevents deletion. Applied at the resource group level, it protects all resources within RG1.",
    confidence: "high" },

  { id: 277, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "You need to prevent the creation of virtual machines in a resource group named RG1. The solution must allow the creation of other Azure resource types in RG1. What should you use?",
    options: ["A. a lock","B. an Azure role","C. a tag","D. an Azure policy"],
    answer: "D", answerText: "D. an Azure policy",
    explanation: "Azure Policy can enforce rules about what resource types can be created. You can create a policy that denies the deployment of virtual machines specifically while allowing other resource types. A lock would block all deletions/modifications, not restrict specific resource types.",
    confidence: "high" },

  { id: 278, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to ensure that only users whose devices have the latest security patches can access Azure AD-integrated applications. What should you use?",
    options: ["A. a conditional access policy","B. Azure Bastion","C. Azure Firewall","D. Azure Policy"],
    answer: "A", answerText: "A. a conditional access policy",
    explanation: "Azure AD Conditional Access policies can enforce conditions that must be met before granting access to applications. You can configure a policy that requires device compliance (including having the latest security patches) as a condition for accessing Azure AD-integrated apps.",
    confidence: "high" },

  { id: 279, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "What can Azure Information Protection encrypt?",
    options: ["A. network traffic","B. documents and email messages","C. Azure Storage accounts","D. Azure SQL databases"],
    answer: "B", answerText: "B. documents and email messages",
    explanation: "Azure Information Protection (AIP) classifies, labels, and protects documents and email messages. It uses encryption to protect sensitive information in files and emails, ensuring that only authorized users can access the content.",
    confidence: "high" },

  { id: 280, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "You need to evaluate whether your Azure environment meets regulatory requirements. What should you use?",
    options: ["A. Knowledge Center website","B. Advisor blade from Azure portal","C. Compliance Manager from Service Trust Portal","D. Solutions blade from Azure portal"],
    answer: "D", answerText: "D. Solutions blade from Azure portal",
    explanation: "The Solutions blade in the Azure portal provides tools to help evaluate and improve your compliance posture. Note: Compliance Manager in the Service Trust Portal also helps track regulatory compliance. The community is split between C and D for this question.",
    confidence: "medium" },

  { id: 282, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "Where can you find details about personal data collected by Microsoft, how it is used, and for what purposes?",
    options: ["A. Data Protection Addendum","B. Microsoft Online Services Terms","C. Microsoft Privacy Statement","D. Azure Security Center"],
    answer: "C", answerText: "C. Microsoft Privacy Statement",
    explanation: "The Microsoft Privacy Statement explains what personal data Microsoft collects, how it is used, and for what purposes. It covers all Microsoft products and services, including Azure, and describes Microsoft's commitment to privacy.",
    confidence: "high" },

  { id: 284, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "When an Azure Policy is assigned to a subscription, an existing non-compliant virtual network is " },
      { blank: "BLANK1", options: ["deleted immediately","disabled","marked as Non-compliant but continues to function normally","automatically remediated"], answer: "marked as Non-compliant but continues to function normally" },
      { text: "." }
    ],
    explanation: "Azure Policy does not delete or modify existing non-compliant resources when a policy is assigned. Instead, existing non-compliant resources are flagged and reported as non-compliant, but they continue to function normally. New resources or updates are blocked from being non-compliant.",
    confidence: "high" },

  { id: 286, type: "hotspot", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — For each of the following statements about Azure tags, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You can use Azure Policy to enforce tagging rules on resources.", answer: "Yes" },
      { text: "There is a maximum of 50 tags per resource or resource group.", answer: "Yes" },
      { text: "Tags applied to a resource group are automatically inherited by all resources within that group.", answer: "No" },
    ],
    explanation: "Azure Policy can enforce tagging requirements. The maximum is 50 tag name/value pairs per resource or resource group. Tags are NOT automatically inherited — resources within a resource group do not inherit the resource group's tags unless you use Azure Policy to enforce inheritance.",
    confidence: "high" },

  { id: 290, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "You need to evaluate whether your Azure environment meets regulatory requirements. What should you use?",
    options: ["A. Azure Service Health","B. Azure Knowledge Center","C. Microsoft Defender for Cloud","D. Azure Advisor"],
    answer: "C", answerText: "C. Microsoft Defender for Cloud",
    explanation: "Microsoft Defender for Cloud (formerly Azure Security Center) includes a regulatory compliance dashboard that shows how your environment measures up against various compliance standards (ISO 27001, PCI DSS, SOC, etc.) and helps you evaluate and improve your compliance posture.",
    confidence: "high" },

  { id: 293, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "You need to create an Azure resource to ensure a subscription with resources in several Azure regions meets a policy requirement. What should you create?",
    options: ["A. a read-only lock","B. an Azure policy","C. a management group","D. a reservation"],
    answer: "B", answerText: "B. an Azure policy",
    explanation: "Azure Policy enforces rules and effects over your resources to ensure compliance with corporate standards. A policy definition can be assigned to a subscription scope, which applies across all regions within that subscription.",
    confidence: "high" },

  { id: 294, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "You can track your compliance with regulatory standards such as ISO 27001 by using " },
      { blank: "BLANK1", options: ["Azure Cloud Shell","Microsoft Cloud Partner Portal","Compliance Manager","Trust Center"], answer: "Compliance Manager" },
      { text: "." }
    ],
    explanation: "Compliance Manager in the Microsoft Service Trust Portal helps you track, assign, and verify regulatory compliance activities. It provides a risk-based compliance score and supports standards like ISO 27001, GDPR, SOC 2, and many others.",
    confidence: "high" },

  { id: 296, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "The Microsoft Privacy Statement explains " },
      { blank: "BLANK1", options: ["the SLA commitments for Azure services","legal terms for using Microsoft services","what personal data Microsoft processes, how it is processed, and the purpose of processing","the security controls Microsoft uses to protect data"], answer: "what personal data Microsoft processes, how it is processed, and the purpose of processing" },
      { text: "." }
    ],
    explanation: "The Microsoft Privacy Statement describes what personal data Microsoft collects, how it uses that data, and the purposes for processing. It applies to all Microsoft products and services and demonstrates Microsoft's transparency about data practices.",
    confidence: "high" },

  { id: 297, type: "dropdown", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "" },
      { blank: "BLANK1", options: ["Authentication","Authorization","Identification","Federation"], answer: "Authentication" },
      { text: " is the process of verifying a user's credentials, while authorization determines what actions the authenticated user is allowed to perform." }
    ],
    explanation: "Authentication is the process of verifying who you are (verifying credentials like username and password). Authorization is the process of determining what you are allowed to do after being authenticated. These are two distinct but related security concepts.",
    confidence: "high" },

  { id: 304, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "Your company needs to identify whether Azure services are compliant with its regional regulatory requirements. What should you use?",
    options: ["A. Knowledge Center","B. Azure Marketplace","C. MyApps portal","D. Trust Center"],
    answer: "D", answerText: "D. Trust Center",
    explanation: "The Microsoft Trust Center provides detailed information about Microsoft's security, privacy, compliance, and transparency practices. It includes information about certifications, regulations, and compliance offerings for different regions, helping you determine if Azure meets your regional requirements.",
    confidence: "high" },

  { id: 305, type: "hotspot", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each of the following statements about Azure AD authorization, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure AD is the only identity provider that can authorize access to Azure resources.", answer: "No" },
      { text: "Third-party cloud services and on-premises Active Directory can access Azure resources through federation with Azure AD.", answer: "Yes" },
      { text: "Azure AD is the centralized identity provider and primary authentication/authorization service for Azure.", answer: "Yes" },
    ],
    explanation: "Other identity providers (like ADFS) can authorize via federation with Azure AD — Azure AD is not the only option. Third-party and on-premises AD can federate with Azure AD for access. Azure AD is the central identity platform and primary auth service for Azure.",
    confidence: "high" },

  { id: 306, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "To prevent the accidental deletion of a resource group, you should configure a " },
      { blank: "BLANK1", options: ["ReadOnly lock","CanNotDelete lock","Azure Policy","Role-Based Access Control (RBAC) assignment"], answer: "CanNotDelete lock" },
      { text: " on the resource group. This lock applies to everyone, including global administrators." }
    ],
    explanation: "A CanNotDelete lock prevents accidental deletion of resources. When applied to a resource group, it prevents deletion of the group and all its resources. Even global administrators cannot delete locked resources without first removing the lock.",
    confidence: "high" },

  { id: 308, type: "hotspot", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "HOTSPOT — For each Azure feature, select the correct description.",
    statements: [
      { text: "Single Sign-On (SSO) allows users to sign in once and access multiple applications without re-entering credentials.", answer: "Yes" },
      { text: "Authorization is the process of verifying the identity of a user.", answer: "No" },
      { text: "Azure AD Conditional Access collects signals, makes decisions, and enforces access policies.", answer: "Yes" },
    ],
    explanation: "SSO enables one login for multiple apps. Authorization determines what an authenticated user can do (NOT verifying identity — that is authentication). Conditional Access collects signals (user, location, device) and enforces policy decisions.",
    confidence: "high" },

  { id: 309, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "What is guaranteed in an Azure Service Level Agreement (SLA) for virtual machines?",
    options: ["A. uptime","B. feature availability","C. bandwidth","D. performance"],
    answer: "A", answerText: "A. uptime",
    explanation: "Azure SLAs for virtual machines guarantee uptime — the percentage of time the service will be available. SLAs do not guarantee specific performance levels, bandwidth, or feature availability. For example, VMs in an Availability Set guarantee 99.95% uptime.",
    confidence: "high" },

  { id: 310, type: "dropdown", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "Azure features that are available to any user with an Azure subscription to try at reduced cost, often without formal SLA commitments, are in " },
      { blank: "BLANK1", options: ["Private Preview","Public Preview","General Availability","Early Access"], answer: "Public Preview" },
      { text: "." }
    ],
    explanation: "Public Preview features are available to all Azure subscribers for testing before general availability. They are often available at a discount or for free, but are explicitly excluded from SLAs. Private Preview requires an invitation from Microsoft.",
    confidence: "high" },

  { id: 311, type: "yesno", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company needs a support plan that provides phone and email access to engineers for support issues.\n\nProposed solution: Purchase a Basic support plan.\n\nDoes this meet the goal?",
    answer: "No",
    explanation: "The Basic support plan does not provide technical support from engineers. It only includes access to documentation, self-help tools, and Azure Advisor. Plans that include phone and email access to engineers include Developer (email only), Standard, Professional Direct, and Premier.",
    confidence: "high" },

  { id: 312, type: "yesno", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company needs a support plan that provides phone and email access to engineers for support issues.\n\nProposed solution: Purchase a Standard support plan.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "The Standard support plan provides 24/7 phone and email access to technical support engineers for critical issues, along with fast response times. Standard, Professional Direct, and Premier plans all include phone and email access to engineers.",
    confidence: "high" },

  { id: 313, type: "yesno", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company needs a support plan that provides phone and email access to engineers for support issues.\n\nProposed solution: Purchase a Premier support plan.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "The Premier support plan provides comprehensive phone and email access to engineers, along with the highest level of support including designated technical account managers, proactive services, and on-site support options.",
    confidence: "high" },

  { id: 314, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company needs an architectural review from Microsoft engineers. The company currently has a Basic support plan. You need to minimize costs. Which support plan should you upgrade to?",
    options: ["A. Premier","B. Developer","C. Professional Direct","D. Standard"],
    answer: "C", answerText: "C. Professional Direct",
    explanation: "Professional Direct is the lowest-cost support plan that includes access to Microsoft engineers for architectural guidance and advisory services (ProDirect delivery managers). Premier is more expensive and offers more services, but Professional Direct minimizes cost while meeting the requirement.",
    confidence: "high" },

  { id: 315, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure service previews, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Most Azure services go through private preview, then public preview, then general availability.", answer: "Yes" },
      { text: "Public preview services can only be managed using the Azure portal.", answer: "No" },
      { text: "Services in preview are available at the same cost as general availability services.", answer: "No" },
    ],
    explanation: "Services typically go through private preview → public preview → general availability. Public preview services can be managed using the portal, CLI, PowerShell, and APIs — not just the portal. Preview services are typically available at reduced cost, and costs increase when services reach general availability.",
    confidence: "high" },

  { id: 316, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company wants to use Azure Cost Management to monitor and reduce Azure spending. What type of Azure subscription is required to use Azure Cost Management?",
    options: ["A. Free Trial","B. Azure for Students","C. Enterprise Agreement only","D. Pay-as-you-go"],
    answer: "D", answerText: "D. Pay-as-you-go",
    explanation: "Azure Cost Management is available to customers with pay-as-you-go subscriptions and other subscription types. It is not limited to Enterprise Agreements, but some features may vary by subscription type. The community is somewhat split on this question.",
    confidence: "medium" },

  { id: 317, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — Your free Azure trial subscription expires. For each of the following actions, select Yes if you can still perform it. Otherwise, select No.",
    statements: [
      { text: "You can start virtual machines that were previously running.", answer: "No" },
      { text: "You can create new Azure Active Directory (Azure AD) user accounts.", answer: "Yes" },
      { text: "You can access data stored in Azure Storage accounts.", answer: "Yes" },
    ],
    explanation: "When a free trial expires, VMs are stopped and cannot be started until you upgrade. However, you can still access the portal, manage Azure AD accounts, and access previously stored data. You must upgrade to a paid subscription to run compute resources again.",
    confidence: "high" },

  { id: 318, type: "yesno", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company needs a support plan that provides phone and email access to technical support engineers.\n\nProposed solution: Purchase a Professional Direct support plan.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "The Professional Direct support plan provides phone and email access to technical support engineers with fast response times, architecture support, and access to ProDirect delivery managers. This meets the goal of phone and email access to engineers.",
    confidence: "high" },

  { id: 319, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company has existing SQL Server licenses with Software Assurance. You need to minimize the cost of running SQL Server workloads in Azure. What should you use?",
    options: ["A. Azure Reservations","B. Azure Hybrid Benefit","C. Azure Spot VMs","D. Azure Dev/Test pricing"],
    answer: "B", answerText: "B. Azure Hybrid Benefit",
    explanation: "Azure Hybrid Benefit allows customers to use their existing on-premises SQL Server (and Windows Server) licenses with Software Assurance on Azure, significantly reducing the cost of running SQL Server in Azure VMs or Azure SQL Database.",
    confidence: "high" },

  { id: 320, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company has multiple departments that need separate Azure billing. What should you create to ensure each department is billed separately?",
    options: ["A. a separate resource group for each department","B. a separate subscription for each department","C. a separate management group for each department","D. a separate Azure AD tenant for each department"],
    answer: "B", answerText: "B. a separate subscription for each department",
    explanation: "In Azure, billing is done at the subscription level. Creating a separate subscription for each department allows each department to have its own billing, separate cost tracking, and independent spending controls.",
    confidence: "high" },

  { id: 321, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure free accounts, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "An Azure free account has a spending limit.", answer: "Yes" },
      { text: "An Azure free account provides unlimited storage.", answer: "No" },
      { text: "An Azure free account provides unlimited access to all Azure services.", answer: "No" },
    ],
    explanation: "Azure free accounts have a spending limit (which stops services when the limit is reached). They do NOT provide unlimited storage — they include limited free storage amounts. They do NOT provide unlimited access — they include limited free usage of popular services for 12 months plus some always-free services.",
    confidence: "high" },

  { id: 322, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about the Azure service lifecycle, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Private preview is available only to selected customers invited by Microsoft.", answer: "Yes" },
      { text: "Public preview is available to all Azure customers.", answer: "Yes" },
      { text: "General availability (GA) is available only to a subset of customers.", answer: "No" },
    ],
    explanation: "Private preview requires an invitation from Microsoft and is limited to select customers. Public preview is open to all Azure customers. General availability (GA) means the service is fully released and available to all customers — not just a subset.",
    confidence: "high" },

  { id: 325, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "An application uses Azure SQL Database (99.99% SLA) and Azure App Service (99.95% SLA). What is the composite SLA for the application?",
    options: ["A. 99.99%","B. 99.95%","C. 99.94% (0.9999 × 0.9995)","D. 99.9%"],
    answer: "C", answerText: "C. 99.94% (0.9999 × 0.9995)",
    explanation: "The composite SLA for dependent services is calculated by multiplying the individual SLAs: 0.9999 × 0.9995 = 0.9994 = 99.94%. The composite SLA is always lower than the lowest individual SLA when services are dependent on each other.",
    confidence: "high" },

  { id: 326, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure SLAs, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "99.9% is the minimum SLA guarantee for all Azure services.", answer: "Yes" },
      { text: "Deploying resources across multiple Azure regions can increase the effective SLA.", answer: "Yes" },
      { text: "Increasing the number of Azure subscriptions increases the SLA for Azure services.", answer: "No" },
    ],
    explanation: "99.9% is the baseline SLA for most Azure services. Using multiple regions with redundancy effectively increases availability beyond any single service SLA. The number of subscriptions has no effect on service SLAs.",
    confidence: "medium" },

  { id: 327, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Under the Modern Lifecycle Policy, what is the minimum notice Microsoft provides before ending support for an Azure product?",
    options: ["A. 6 months","B. 12 months","C. 24 months","D. 36 months"],
    answer: "B", answerText: "B. 12 months",
    explanation: "Under Microsoft's Modern Lifecycle Policy, Microsoft provides at least 12 months of notice before ending support for a product, unless earlier termination is required for security or legal reasons. This gives customers time to plan and migrate.",
    confidence: "high" },

  { id: 328, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "Your company needs to increase the quota for the number of virtual machines in an Azure subscription. What should you use?",
    options: ["A. Azure Advisor","B. Azure Monitor","C. Help + support blade in the Azure portal","D. Azure Cost Management"],
    answer: "C", answerText: "C. Help + support blade in the Azure portal",
    explanation: "To request a quota increase for Azure resources (such as the number of VMs per subscription), you submit a support request through the Help + support blade in the Azure portal. This creates a service request to Microsoft to increase your subscription limits.",
    confidence: "high" },

  { id: 329, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "You need to be notified when monthly Azure costs exceed a specific threshold. What should you configure?",
    options: ["A. Azure Monitor metric alerts","B. Azure Cost Management budget alerts","C. Azure Service Health alerts","D. Azure Advisor recommendations"],
    answer: "B", answerText: "B. Azure Cost Management budget alerts",
    explanation: "Azure Cost Management allows you to create budgets and configure budget alerts that notify you (via email) when spending reaches a specified percentage of your budget. This is the correct tool for cost threshold notifications.",
    confidence: "high" },

  { id: 331, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure ExpressRoute data transfer costs, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Inbound data transfers over ExpressRoute are free.", answer: "Yes" },
      { text: "Outbound data transfers over ExpressRoute are free.", answer: "No" },
      { text: "ExpressRoute includes a metered data plan option with per-GB outbound charges.", answer: "Yes" },
    ],
    explanation: "With Azure ExpressRoute, inbound data (from on-premises to Azure) is always free. Outbound data (from Azure to on-premises) is charged based on the plan type — either unlimited data or metered data with per-GB charges.",
    confidence: "high" },

  { id: 332, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company wants to reduce Azure costs. You should recommend removing which type of resource to achieve the greatest cost reduction?",
    options: ["A. resource groups with no resources","B. public IP addresses assigned to stopped VMs","C. empty Azure Storage containers","D. unused Azure AD accounts"],
    answer: "B", answerText: "B. public IP addresses assigned to stopped VMs",
    explanation: "Public IP addresses (Static or Standard SKU) incur charges even when not associated with a running resource. Removing unused public IP addresses from stopped or deallocated VMs directly reduces costs. Resource groups, empty containers, and unused AD accounts do not directly incur significant costs.",
    confidence: "high" },

  { id: 334, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure storage pricing, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You are charged for data transfers between Azure storage and resources in the same Azure region.", answer: "No" },
      { text: "You are charged for both read and write operations on Azure Blob storage.", answer: "No" },
      { text: "When copying data from one Azure region to another, you are charged for outbound data transfer on both the source and destination.", answer: "No" },
    ],
    explanation: "Data transfers within the same Azure region are free. For Blob storage, you are charged per-operation (reads are typically free or very low cost, not both read and write at same rates). For cross-region transfers, you are charged only for outbound data from the source region — not on both sides.",
    confidence: "high" },

  { id: 335, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure Active Directory Premium SLA, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure Active Directory Premium has a 99.9% SLA.", answer: "Yes" },
      { text: "Azure Active Directory Free tier has the same SLA as Azure AD Premium.", answer: "No" },
      { text: "You can claim a service credit if the Azure AD Premium SLA is not met.", answer: "Yes" },
    ],
    explanation: "Azure AD Premium P1 and P2 carry a 99.9% uptime SLA. The Azure AD Free tier does not have the same SLA guarantee as Premium tiers. When an SLA is missed, customers can claim service credits as specified in the Azure SLA terms.",
    confidence: "high" },

  { id: 336, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure costs, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Resource groups incur a monthly charge.", answer: "No" },
      { text: "Data ingress (inbound) over a VPN connection to Azure is free.", answer: "No" },
      { text: "Data egress (outbound) over a VPN connection from Azure is charged.", answer: "Yes" },
    ],
    explanation: "Resource groups are free management containers with no cost. Data ingress (inbound to Azure) is generally free, including over VPN. Data egress (outbound from Azure) — including over VPN — incurs transfer charges.",
    confidence: "high" },

  { id: 337, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Who can use the Azure Total Cost of Ownership (TCO) calculator?",
    options: ["A. billing readers only","B. subscription owners only","C. anyone","D. users with an Azure AD account linked to an Azure subscription"],
    answer: "C", answerText: "C. anyone",
    explanation: "The Azure Total Cost of Ownership (TCO) calculator is a free, publicly available web tool. Anyone can use it — including people who don't have an Azure account — to estimate the cost savings of migrating workloads from on-premises to Azure.",
    confidence: "high" },

  { id: 338, type: "dropdown", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "When an Azure SLA is not met and you are eligible for a service credit, the credit is applied " },
      { blank: "BLANK1", options: ["to all Azure services in your subscription","to the specific service where the SLA was not met","as a cash refund to your payment method","to all services in the affected Azure region"], answer: "to the specific service where the SLA was not met" },
      { text: "." }
    ],
    explanation: "Azure service credits for SLA violations apply only to the specific service that failed to meet the SLA — not to all Azure services or all services in a region. Credits are applied as Azure billing credits, not cash refunds.",
    confidence: "high" },

  { id: 339, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "Which task can Azure Advisor perform?",
    options: ["A. Integrate Active Directory with Azure AD","B. Estimate costs of moving workloads to Azure","C. Confirm that Azure subscription security follows best practices","D. Evaluate on-premises resources for migration to Azure"],
    answer: "C", answerText: "C. Confirm that Azure subscription security follows best practices",
    explanation: "Azure Advisor is a personalized cloud consultant that analyzes your Azure configuration and usage and provides recommendations in five areas: Reliability, Security, Performance, Cost, and Operational Excellence. It evaluates whether your security settings follow best practices.",
    confidence: "high" },

  { id: 341, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "An app uses two Azure services. Service A has a 99.9% SLA and Service B has a 99.99% SLA. What is the composite SLA for the app?",
    options: ["A. 99.89001% (0.999 × 0.9999)","B. 99.91% (0.999 / 0.9999)","C. 99.99% (maximum)","D. 99.9% (minimum)"],
    answer: "A", answerText: "A. 99.89001% (0.999 × 0.9999)",
    explanation: "The composite SLA for dependent services is calculated by multiplying the individual SLAs together: 0.999 × 0.9999 = 0.9989001 = approximately 99.89%. The composite SLA is lower than both individual SLAs because both services must function for the app to work.",
    confidence: "high" },

  { id: 344, type: "dropdown", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "The Azure service lifecycle phase that has no SLA commitments but is available to any customer with the proper Azure AD license is called " },
      { blank: "BLANK1", options: ["Private Preview","Public Preview","General Availability","Limited Release"], answer: "Public Preview" },
      { text: "." }
    ],
    explanation: "Public Preview services are available to any Azure customer (with appropriate licensing) to test before general availability. Normal SLAs do not apply to preview services, but support is provided. Private Preview is invite-only.",
    confidence: "high" },

  { id: 345, type: "dropdown", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.",
    segments: [
      { text: "When a virtual machine is in a Stopped (Deallocated) state, you are still charged for " },
      { blank: "BLANK1", options: ["compute (CPU/RAM)","networking bandwidth","storage (OS and data disks)","software licensing only"], answer: "storage (OS and data disks)" },
      { text: "." }
    ],
    explanation: "When a VM is deallocated (Stopped/Deallocated), you stop paying for compute resources (CPU and RAM). However, the OS disk and any attached data disks continue to incur storage charges since the managed disks still exist.",
    confidence: "high" },
  { id: 346, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.\n\nThe [BLANK1] describes what personal data Microsoft processes, how Microsoft processes it, and for what purposes.",
    segments: [
      { text: "The " },
      { blank: "BLANK1", options: ["Microsoft Online Services Terms","Microsoft Privacy Statement","Azure Trust Center","Service Level Agreement"], answer: "Microsoft Privacy Statement" },
      { text: " describes what personal data Microsoft processes, how Microsoft processes it, and for what purposes." }
    ],
    explanation: "The Microsoft Privacy Statement explains what personal data Microsoft collects, how it's used, and the purposes behind it. The Microsoft Online Services Terms covers contractual obligations, and the Trust Center provides compliance documentation.",
    confidence: "high" },
  { id: 347, type: "dropdown", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "HOTSPOT — Select the answer that correctly completes the sentence.\n\nCompliance Manager is accessed from the [BLANK1].",
    segments: [
      { text: "Compliance Manager is accessed from the " },
      { blank: "BLANK1", options: ["Azure portal","Microsoft 365 compliance center","Microsoft Defender portal","Azure Security Center"], answer: "Microsoft 365 compliance center" },
      { text: "." }
    ],
    explanation: "Compliance Manager is a feature within the Microsoft 365 compliance center (now Microsoft Purview compliance portal). It helps organizations manage, assess, and improve their compliance posture.",
    confidence: "high" },
  { id: 351, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "What SLA does Microsoft provide for Azure services that are in public preview?",
    options: ["A. No SLA is provided for services in public preview","B. 99.9% uptime","C. 99.95% uptime","D. Each region defines its own SLA for preview services"],
    answer: "A", answerText: "A. No SLA is provided for services in public preview",
    explanation: "Azure services in public preview are not covered by SLAs. Public previews are made available for evaluation purposes only, and Microsoft recommends they not be used in production workloads. Services only receive SLA commitments once they reach general availability (GA).",
    confidence: "high" },
  { id: 353, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure pricing, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Azure prices are the same in all regions worldwide.", answer: "No" },
      { text: "An Enterprise Agreement can minimize upfront costs compared to pay-as-you-go pricing.", answer: "Yes" },
      { text: "Using Azure Reserved Instances for one or three years can reduce costs compared to pay-as-you-go pricing.", answer: "Yes" }
    ],
    explanation: "Azure prices vary by region due to local infrastructure costs, energy prices, and taxes. Enterprise Agreements do not minimize upfront costs — they typically require upfront commitment, though they offer better rates. Reserved Instances can save up to 72% compared to pay-as-you-go.",
    confidence: "medium" },
  { id: 354, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about cloud financial models, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "In a pay-as-you-go model, customers are billed based on actual usage (e.g., per second or per hour).", answer: "Yes" },
      { text: "Moving workloads to the cloud converts capital expenditure (CapEx) to operational expenditure (OpEx).", answer: "Yes" },
      { text: "Cloud subscription fees are considered capital expenditure (CapEx).", answer: "No" }
    ],
    explanation: "Pay-as-you-go billing is usage-based and eliminates the need for upfront purchases. Cloud computing converts CapEx (buying hardware) to OpEx (paying for services as used). Subscription fees are OpEx — ongoing operating costs — not CapEx.",
    confidence: "high" },
  { id: 355, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "What is the longest term available when purchasing Azure Reserved Virtual Machine Instances?",
    options: ["A. six months","B. one year","C. two years","D. three years"],
    answer: "D", answerText: "D. three years",
    explanation: "Azure Reserved VM Instances are available in 1-year or 3-year terms. The 3-year reservation provides the maximum discount — up to 72% compared to pay-as-you-go pricing — in exchange for committing to use the instance for that duration.",
    confidence: "high" },
  { id: 356, type: "hotspot", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "HOTSPOT — For each of the following statements about Azure preview phases, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Private preview features are available to all Azure customers who want to test them.", answer: "No" },
      { text: "You can use public preview features in production workloads.", answer: "Yes" },
      { text: "Public preview features are covered by the same SLAs as generally available services.", answer: "No" }
    ],
    explanation: "Private preview is by invitation only — not available to all customers. Public preview features can technically be used in production, but Microsoft advises caution as they lack SLA coverage. Public previews are explicitly excluded from standard SLAs.",
    confidence: "high" },
  { id: 357, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "Your company wants to generate billing reports grouped by office location. Which Azure Resource Manager feature should you use before generating the reports?",
    options: ["A. tags","B. templates","C. locks","D. policies"],
    answer: "A", answerText: "A. tags",
    explanation: "Azure tags are name-value pairs applied to resources and resource groups to organize them for billing and management. By tagging resources with an 'Office' or 'Location' tag, you can filter and group billing reports by office. Templates, locks, and policies serve different purposes.",
    confidence: "high" },
  { id: 358, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure support plans, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "An Azure free account automatically includes Standard support.", answer: "No" },
      { text: "You can purchase a Professional Direct support plan through a Microsoft Customer Agreement.", answer: "Yes" },
      { text: "Only paid Azure subscription holders can access support through MSDN forums.", answer: "No" }
    ],
    explanation: "A free Azure account includes Basic support only, not Standard. Professional Direct and other paid plans can be purchased through a Microsoft Customer Agreement. MSDN forums are available to all Azure users, including free tier, not only paid subscribers.",
    confidence: "high" },
  { id: 359, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "According to the Microsoft Modern Lifecycle Policy, how much advance notice must Microsoft provide before ending support for a product or service that does not have a successor?",
    options: ["A. 12 months","B. 6 months","C. 90 days","D. 30 days"],
    answer: "A", answerText: "A. 12 months",
    explanation: "Under the Microsoft Modern Lifecycle Policy, Microsoft commits to providing at least 12 months' advance notice before ending support for a product or service if there is no successor product offered to replace it.",
    confidence: "high" },
  { id: 360, type: "hotspot", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "HOTSPOT — For each of the following statements about Azure subscriptions, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "The subscription owner can transfer ownership of an Azure subscription to another account.", answer: "No" },
      { text: "You can convert a free trial Azure subscription to a Pay-As-You-Go subscription.", answer: "Yes" },
      { text: "You can remove the spending limit on an Azure subscription.", answer: "Yes" }
    ],
    explanation: "Transferring subscription ownership requires Billing Administrator or Global Administrator role — not just subscription owner. Free trials can be upgraded to Pay-As-You-Go to continue using services after trial expiry. The spending limit can be removed (but not increased or decreased — it is either on or off).",
    confidence: "high" },
  { id: 361, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure VM costs, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "Purchasing a reserved instance commits you to using the VM for 1 or 3 years at a discounted price.", answer: "Yes" },
      { text: "The only factor that affects the cost of an Azure VM is its size (number of vCPUs and RAM).", answer: "No" },
      { text: "When a VM is stopped (deallocated), you are still charged for storage but not for compute.", answer: "Yes" }
    ],
    explanation: "Reserved instances require a 1- or 3-year commitment in exchange for significant discounts. VM cost is also affected by storage type/size, operating system licensing, networking, and region — not just VM size. Deallocated VMs release compute resources (no compute charge) but the OS disk and data disks remain, incurring storage charges.",
    confidence: "high" },
  { id: 362, type: "yesno", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company wants to reduce Azure costs.\n\nProposed solution: Remove unused network interfaces.\n\nDoes this meet the goal?",
    answer: "No",
    explanation: "Azure does not charge for unused network interfaces (NICs). Deleting them does not reduce costs. To reduce costs, focus on items that are billed, such as unused public IP addresses, underutilized VMs, or orphaned managed disks.",
    confidence: "high" },
  { id: 363, type: "yesno", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company wants to reduce Azure costs.\n\nProposed solution: Remove unused public IP addresses.\n\nDoes this meet the goal?",
    answer: "Yes",
    explanation: "Azure charges for public IP addresses, even when they are not associated with a running resource. Removing unused public IP addresses will reduce your Azure bill, making this a valid cost-reduction strategy.",
    confidence: "high" },
  { id: 364, type: "yesno", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company wants to reduce Azure costs.\n\nProposed solution: Remove unused user accounts from Azure Active Directory.\n\nDoes this meet the goal?",
    answer: "No",
    explanation: "Azure AD does not charge per user account in most tiers. Removing unused user accounts does not directly reduce Azure infrastructure costs. Cost reduction strategies should target billable resources like VMs, storage, and public IPs.",
    confidence: "high" },
  { id: 365, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Which formula correctly represents how to calculate the Monthly Uptime Percentage for Azure SLA purposes?",
    options: ["A. (Maximum Available Minutes − Downtime Minutes) / Maximum Available Minutes × 100","B. (Downtime Minutes / Maximum Available Minutes) × 100","C. (Maximum Available Minutes / Downtime Minutes) × 100","D. (Maximum Available Minutes + Downtime Minutes) / Maximum Available Minutes × 100"],
    answer: "A", answerText: "A. (Maximum Available Minutes − Downtime Minutes) / Maximum Available Minutes × 100",
    explanation: "The Monthly Uptime Percentage formula used in Azure SLAs is: ((Maximum Available Minutes − Downtime) / Maximum Available Minutes) × 100. This gives the percentage of time the service was available. For example, if a service has 5 minutes of downtime in a 43,800-minute month, uptime = (43,795 / 43,800) × 100 = 99.99%.",
    confidence: "high" },
  { id: 366, type: "hotspot", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "HOTSPOT — For each of the following statements about Azure costs, select Yes if the statement is true. Otherwise, select No.",
    statements: [
      { text: "You are charged for resource groups.", answer: "No" },
      { text: "You are charged for data ingress (incoming data) transferred over a VPN connection.", answer: "No" },
      { text: "You are charged for data egress (outgoing data) transferred over a VPN connection.", answer: "Yes" }
    ],
    explanation: "Resource groups are free — they are logical containers with no associated cost. Data ingress to Azure is generally free. However, data egress (outbound data leaving Azure, including over VPN connections) is charged based on volume and the destination region.",
    confidence: "high" },
  { id: 367, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Which Azure support plan provides access to best practices guidance, service health status notifications, and 24/7 billing and subscription support at the lowest possible cost?",
    options: ["A. Basic","B. Developer","C. Standard","D. Premier"],
    answer: "A", answerText: "A. Basic",
    explanation: "The Basic support plan is free and includes access to Azure Advisor best practices, service health and status notifications, and 24/7 access to billing and subscription management support. It does not include technical support from engineers. Basic is the lowest cost option that covers these specific features.",
    confidence: "high" },
  { id: 368, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "In which Azure support plans can you open a new technical support request?",
    options: ["A. Premier and Professional Direct only","B. Premier, Professional Direct, and Standard only","C. Premier, Professional Direct, Standard, and Developer only","D. Premier, Professional Direct, Standard, Developer, and Basic"],
    answer: "D", answerText: "D. Premier, Professional Direct, Standard, Developer, and Basic",
    explanation: "All Azure support plans — including Basic — allow you to open support requests for billing and subscription issues. For technical support requests, Developer, Standard, Professional Direct, and Premier plans are required. The question as stated includes all plans (Basic allows billing requests). This is a common exam point: even Basic supports opening certain types of requests.",
    confidence: "medium" },
  { id: 369, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Where can you create a new Azure support request instead of using support.microsoft.com?",
    options: ["A. support.microsoft.com is the only location","B. the Azure portal","C. the Azure Knowledge Center","D. the Microsoft 365 Security & Compliance admin center"],
    answer: "B", answerText: "B. the Azure portal",
    explanation: "Azure support requests can be created from the Azure portal via the Help + Support blade. This provides an alternative to support.microsoft.com for raising technical and billing issues with Microsoft support.",
    confidence: "high" },
  { id: 370, type: "yesno", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Your company wants to reduce Azure costs.\n\nProposed solution: Remove unused Azure Active Directory groups.\n\nDoes this meet the goal?",
    answer: "No",
    explanation: "Azure AD groups are not a billable resource. Removing unused groups does not reduce Azure costs. To reduce costs, focus on billable resources such as unused VMs, managed disks, public IP addresses, or Azure AD premium licenses.",
    confidence: "high" },
  { id: 371, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Which Azure support plan is the lowest-cost option that includes 24/7 phone and email access to support engineers for technical issues?",
    options: ["A. Standard","B. Developer","C. Basic","D. Professional Direct"],
    answer: "A", answerText: "A. Standard",
    explanation: "The Standard support plan is the lowest-cost paid plan that includes 24/7 access to support engineers by phone and email for technical issues. Developer only offers business-hours access via email. Basic has no technical support. Professional Direct and Premier are higher-cost plans.",
    confidence: "high" },
  { id: 372, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "Under what terms are Azure preview features made available to customers?",
    options: ["A. Under the same terms as generally available services, including full SLA coverage","B. As-is, with all faults, and as available — excluded from SLAs and limited warranty","C. With a reduced SLA of 99.9% instead of the standard 99.99%","D. Under a separate paid preview agreement with Microsoft"],
    answer: "B", answerText: "B. As-is, with all faults, and as available — excluded from SLAs and limited warranty",
    explanation: "Azure preview features are provided 'as-is,' 'with all faults,' and 'as available.' They are explicitly excluded from SLAs and are covered only by limited or no warranty. Microsoft may change or discontinue previews at any time. Customers should not rely on previews for production workloads.",
    confidence: "high" },
  { id: 374, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "Which Azure service allows you to compare your cloud usage against industry standard best practices and receive personalized recommendations?",
    options: ["A. Azure Monitor","B. Azure Service Health","C. Azure Application Insights","D. Azure Advisor"],
    answer: "D", answerText: "D. Azure Advisor",
    explanation: "Azure Advisor analyzes your Azure usage and configuration and provides personalized best practice recommendations across five categories: reliability, security, performance, cost, and operational excellence. It compares your environment against Microsoft's best practices and industry standards.",
    confidence: "high" },
  { id: 375, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "Which tool can you use to start Azure Cloud Shell?",
    options: ["A. the Azure portal","B. Azure CLI installed locally","C. Azure PowerShell installed locally","D. an ARM template deployment"],
    answer: "A", answerText: "A. the Azure portal",
    explanation: "Azure Cloud Shell can be launched directly from the Azure portal by clicking the Cloud Shell icon in the top navigation bar. It provides a browser-based shell experience (Bash or PowerShell) without requiring any local installation. It can also be accessed at shell.azure.com.",
    confidence: "high" },
  { id: 376, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "How many copies of your data does Azure Locally Redundant Storage (LRS) maintain?",
    options: ["A. 3","B. 4","C. 6","D. 9"],
    answer: "A", answerText: "A. 3",
    explanation: "Locally Redundant Storage (LRS) replicates your data three times within a single physical location (data center) in the primary region. All three copies are kept within the same availability zone. LRS protects against server rack and drive failures but not against datacenter-level disasters.",
    confidence: "high" },
  { id: 377, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "Which cloud characteristic describes the ability of a cloud service to quickly adapt to changing business requirements by rapidly deploying and scaling resources?",
    options: ["A. high availability","B. predictability","C. manageability","D. agility"],
    answer: "D", answerText: "D. agility",
    explanation: "Agility in cloud computing refers to the ability to rapidly deploy and scale resources in response to changing business needs. It allows organizations to quickly spin up or tear down services without long procurement cycles. High availability is about uptime, predictability is about consistent performance, and manageability is about managing resources efficiently.",
    confidence: "high" },
  { id: 378, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "Which of the following is an example of vertical scaling in a cloud environment?",
    options: ["A. adding more CPU and RAM to an existing Azure virtual machine","B. adding an additional Azure virtual machine","C. adding more Azure Virtual Desktop session hosts","D. automatically adding App Service instances based on load"],
    answer: "A", answerText: "A. adding more CPU and RAM to an existing Azure virtual machine",
    explanation: "Vertical scaling (scaling up) means increasing the resources of an existing instance — such as adding more CPU cores or RAM to a VM. Horizontal scaling (scaling out) means adding more instances. Adding VMs (B), session hosts (C), or App Service instances (D) are all examples of horizontal scaling.",
    confidence: "high" },
  { id: 381, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "Which additional Azure resource is always required when you deploy an Azure virtual machine?",
    options: ["A. a virtual network","B. a service endpoint","C. Azure Firewall","D. a public IP address"],
    answer: "A", answerText: "A. a virtual network",
    explanation: "When you create an Azure VM, it must be connected to a virtual network (VNet). The VNet provides the network environment for the VM to communicate. A public IP address is optional (VMs can be internal only), Azure Firewall is a separate paid service, and service endpoints are optional network configurations.",
    confidence: "high" },
  { id: 383, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "How many copies of your data does Azure Geo-Redundant Storage (GRS) maintain?",
    options: ["A. 3","B. 4","C. 6","D. 9"],
    answer: "C", answerText: "C. 6",
    explanation: "Geo-Redundant Storage (GRS) maintains six copies of your data: three copies in the primary region (using LRS) and three additional copies in a paired secondary region hundreds of miles away. This protects against regional disasters. Read access to the secondary region requires RA-GRS.",
    confidence: "high" },
  { id: 384, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "What should you use to grant users and groups permission to access Azure Virtual Desktop resources?",
    options: ["A. tags","B. role-based access control (RBAC) roles","C. resource groups","D. application security groups"],
    answer: "B", answerText: "B. role-based access control (RBAC) roles",
    explanation: "Role-Based Access Control (RBAC) is the mechanism in Azure for granting permissions to users, groups, and service principals. For Azure Virtual Desktop, specific RBAC roles control access to host pools, application groups, and workspaces. Tags are for organization/billing, resource groups are logical containers, and application security groups are for network-level access.",
    confidence: "high" },
  { id: 389, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "Which cloud service model minimizes the management responsibility of a customer?",
    options: ["A. IaaS","B. PaaS","C. SaaS"],
    answer: "C", answerText: "C. SaaS",
    explanation: "SaaS (Software as a Service) requires the least management from the customer — the provider manages everything including applications, runtime, OS, storage, networking, and hardware. With PaaS, the customer manages applications and data. With IaaS, the customer manages the most: OS, middleware, runtime, applications, and data.",
    confidence: "high" },
  { id: 390, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "Which of the following correctly orders cloud service models from MOST to LEAST customer management responsibility?",
    options: ["A. IaaS → PaaS → SaaS","B. SaaS → PaaS → IaaS","C. PaaS → IaaS → SaaS","D. SaaS → IaaS → PaaS"],
    answer: "A", answerText: "A. IaaS → PaaS → SaaS",
    explanation: "IaaS gives customers the most control and responsibility (OS, runtime, middleware, apps, data). PaaS abstracts infrastructure — customers manage apps and data. SaaS requires the least customer responsibility — the provider handles everything. So the order from most to least customer responsibility is: IaaS → PaaS → SaaS.",
    confidence: "high" },
  { id: 398, type: "multi", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "You need to manage Azure web app settings from an iPhone. Which TWO tools can you use?",
    options: ["A. Windows PowerShell","B. Azure Cloud Shell","C. the Azure portal","D. Azure Storage Explorer"],
    answer: ["B","C"], answerText: "B. Azure Cloud Shell, C. the Azure portal",
    explanation: "Azure Cloud Shell runs in a browser and is accessible from any device including an iPhone via shell.azure.com or the Azure mobile app. The Azure portal is also mobile-friendly and accessible from any browser. Windows PowerShell requires a Windows desktop installation and is not available natively on iPhone. Azure Storage Explorer is a desktop application.",
    confidence: "high" },
  { id: 399, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "Which Azure service do you use to create a new Azure file share?",
    options: ["A. Azure File Sync","B. Azure Storage account","C. Azure Data Box","D. Azure Blob Storage"],
    answer: "B", answerText: "B. Azure Storage account",
    explanation: "Azure Files (file shares) are created within an Azure Storage account. You navigate to a storage account in the Azure portal, select the 'File shares' blade, and create a new file share from there. Azure File Sync is used to sync on-premises Windows Server file shares with Azure Files — it doesn't create the share itself.",
    confidence: "high" },
  { id: 401, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "You need to prevent Azure virtual network traffic from routing to Azure Storage over the public internet. What should you configure?",
    options: ["A. a network security group (NSG)","B. a public endpoint","C. Azure VPN Gateway","D. a service endpoint"],
    answer: "D", answerText: "D. a service endpoint",
    explanation: "A Virtual Network Service Endpoint extends your VNet's private address space to Azure services (like Azure Storage) over the Azure backbone network — bypassing the public internet entirely. NSGs control inbound/outbound traffic rules but don't change routing. VPN Gateway connects on-premises networks to Azure, not VNet-to-Storage routing.",
    confidence: "high" },
  { id: 402, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "Which Azure service can automatically replace a resource lock if it is removed?",
    options: ["A. Azure Information Protection (AIP)","B. Azure Blueprints","C. Azure Backup","D. Azure Advisor"],
    answer: "B", answerText: "B. Azure Blueprints",
    explanation: "Azure Blueprints can define and deploy a set of Azure resources including resource locks. If someone removes a lock that was deployed by a Blueprint, Blueprints can automatically re-apply it when the Blueprint assignment is enforced (using 'lock' mode). AIP is for data classification, Azure Backup is for data recovery, and Azure Advisor provides recommendations.",
    confidence: "high" },
  { id: 403, type: "single", topic: "AzureIdentity", topicLabel: "Azure Identity & Security",
    question: "Which service do you use to create a new user for an Azure subscription?",
    options: ["A. Azure Active Directory","B. Azure Subscription settings","C. Azure Resource Manager","D. Azure Policy"],
    answer: "A", answerText: "A. Azure Active Directory",
    explanation: "User accounts are managed in Azure Active Directory (Azure AD). To create a new user who can access Azure resources, you add them to the Azure AD tenant associated with your subscription. Role assignments in Azure RBAC then control what they can do within the subscription.",
    confidence: "high" },
  { id: 405, type: "multi", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "You need to collect and analyze event details from 5 Azure virtual machines and run queries to compare results across all VMs. Which TWO tools should you use?",
    options: ["A. Azure Service Health","B. Azure Service Bus","C. Azure Monitor","D. Azure Advisor","E. Log Analytics"],
    answer: ["C","E"], answerText: "C. Azure Monitor, E. Log Analytics",
    explanation: "Azure Monitor collects metrics and logs from Azure VMs. Log Analytics (a feature within Azure Monitor) provides a query workspace where you can run Kusto (KQL) queries to analyze and compare log data across multiple VMs. Azure Service Health monitors Azure platform health, Service Bus is a messaging service, and Advisor provides best practice recommendations.",
    confidence: "high" },
  { id: 407, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Which Azure feature should you use to track the costs of Azure resources and receive alerts when spending exceeds a specified amount?",
    options: ["A. Azure Quickstart templates","B. tags","C. budgets","D. usage and quotas"],
    answer: "C", answerText: "C. budgets",
    explanation: "Azure Cost Management budgets let you set spending thresholds for Azure resources and automatically send alerts (email notifications) when actual or forecasted spending reaches configured percentages of the budget. Tags help categorize and filter costs. Usage and quotas track resource limits, not spending alerts. Quickstart templates are for resource deployment.",
    confidence: "high" },
  { id: 408, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "When you create a new Azure virtual machine, where is it placed?",
    options: ["A. In a storage account","B. In a resource group","C. In an administrative unit","D. In an application group"],
    answer: "B", answerText: "B. In a resource group",
    explanation: "Every Azure resource, including virtual machines, must be placed in a resource group at creation time. Resource groups are logical containers that hold related Azure resources. A storage account holds data (blobs, files, queues, tables). Administrative units are Azure AD constructs. Application groups are specific to Azure Virtual Desktop.",
    confidence: "high" },
  { id: 409, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "You need to migrate an on-premises server to Azure using a lift-and-shift approach. Which cloud service type should you use?",
    options: ["A. IaaS","B. SaaS","C. PaaS"],
    answer: "A", answerText: "A. IaaS",
    explanation: "A lift-and-shift migration moves an on-premises server to the cloud with minimal changes. IaaS (Infrastructure as a Service) provides virtual machines that mirror the on-premises server environment — you keep the same OS, applications, and configurations. PaaS and SaaS abstract the infrastructure, requiring application refactoring or replacement.",
    confidence: "high" },
  { id: 411, type: "multi", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Which THREE of the following factors affect the cost of an Azure resource? Select all that apply.",
    options: ["A. volume of outbound data (egress)","B. volume of inbound data (ingress)","C. service tier selected","D. Azure region where the resource is deployed","E. type of processed data"],
    answer: ["A","C","D"], answerText: "A. volume of outbound data, C. service tier selected, D. Azure region",
    explanation: "Azure resource costs are affected by: (A) outbound data egress — you pay per GB for data leaving Azure; (C) service tier — premium tiers cost more than standard; (D) Azure region — prices vary by geography. Inbound data (B) is generally free, and the type of processed data (E) is not a standard billing factor.",
    confidence: "high" },
  { id: 412, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "You need to identify which department is responsible for the cost of each Azure resource. What should you use?",
    options: ["A. budgets","B. alerts","C. tags"],
    answer: "C", answerText: "C. tags",
    explanation: "Azure tags are name-value pairs (e.g., Department: Finance) applied to resources. By tagging resources with the owning department, you can filter cost reports in Azure Cost Management by tag, identifying what each department has spent. Budgets set spending limits, and alerts notify when budgets are exceeded — neither identifies responsibility.",
    confidence: "high" },
  { id: 420, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "You need to manage on-premises Windows Servers from the Azure portal. Which service should you use?",
    options: ["A. Azure Kubernetes Service (AKS)","B. Azure Arc","C. Docker","D. role-based access control (RBAC)"],
    answer: "B", answerText: "B. Azure Arc",
    explanation: "Azure Arc extends Azure management and governance to on-premises, multi-cloud, and edge environments. With Azure Arc, you can project on-premises Windows and Linux servers into Azure, enabling you to manage them from the Azure portal using Azure policies, RBAC, monitoring, and other Azure services. AKS is for Kubernetes, Docker is a container runtime, and RBAC manages permissions.",
    confidence: "high" },
  { id: 423, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "Which Azure tool should you use to identify how long it takes for web pages to load in a user's browser?",
    options: ["A. Azure Monitor alerts","B. Application Insights in Azure Monitor","C. Log Analytics","D. Azure Network Watcher"],
    answer: "B", answerText: "B. Application Insights in Azure Monitor",
    explanation: "Application Insights is an Application Performance Management (APM) service within Azure Monitor. It includes browser-side performance monitoring that tracks page load times, AJAX calls, and user session data. It provides insights into end-user experience from the browser perspective. Log Analytics is for querying logs, Network Watcher monitors network infrastructure, and Azure Monitor alerts trigger on metrics/logs.",
    confidence: "high" },
  { id: 425, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "You are building a desktop application that needs to interact with Azure and manage resources programmatically. What should you use?",
    options: ["A. Azure REST APIs","B. ARM templates","C. Azure CLI","D. Azure Cloud Shell"],
    answer: "A", answerText: "A. Azure REST APIs",
    explanation: "Azure REST APIs allow desktop applications (or any application) to interact with Azure services programmatically. Applications call the APIs using HTTP requests to create, read, update, and delete Azure resources. ARM templates are declarative deployment files (not for interactive app integration), Azure CLI and Cloud Shell are command-line tools for human use, not for embedding in desktop apps.",
    confidence: "high" },
  { id: 429, type: "multi", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "Which TWO features or services can be integrated directly with Azure Monitor?",
    options: ["A. Azure Status page","B. Application Insights","C. Azure Advisor","D. Log Analytics","E. Azure Service Health"],
    answer: ["B","D"], answerText: "B. Application Insights, D. Log Analytics",
    explanation: "Application Insights and Log Analytics are both features of Azure Monitor. Application Insights provides APM and browser monitoring; Log Analytics provides a query workspace for log analysis using KQL. Azure Advisor is a separate recommendation service. Azure Status page and Azure Service Health are separate health monitoring services, though Service Health integrates with Azure Monitor alerts.",
    confidence: "high" },
  { id: 430, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "Which Azure service provides a unified way to project and manage on-premises and multi-cloud resources through Azure Resource Manager (ARM)?",
    options: ["A. Azure Migrate","B. Azure AD Connect","C. Azure Arc","D. Azure Front Door"],
    answer: "C", answerText: "C. Azure Arc",
    explanation: "Azure Arc enables you to project on-premises servers, Kubernetes clusters, and multi-cloud resources into Azure Resource Manager. Once projected, you can apply Azure management capabilities (RBAC, policies, monitoring, Defender) to non-Azure resources as if they were native Azure resources. Azure Migrate is for migration assessment, AD Connect syncs identities, and Front Door is a CDN/load balancer.",
    confidence: "high" },
  { id: 433, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "You need to deploy resources using a repeatable and reliable method that ensures each resource always has the same configuration. What should you use?",
    options: ["A. Azure Policy","B. Azure Arc","C. a resource group","D. Azure Resource Manager (ARM) templates"],
    answer: "D", answerText: "D. Azure Resource Manager (ARM) templates",
    explanation: "ARM templates are JSON-based infrastructure-as-code files that define and deploy Azure resources declaratively and repeatably. Every deployment from the same template produces identical resource configurations. Azure Policy enforces governance rules. Azure Arc manages non-Azure resources. Resource groups are containers, not deployment tools.",
    confidence: "high" },
  { id: 437, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "In the SaaS cloud service model, which responsibility is SHARED between Microsoft and the customer?",
    options: ["A. identity and directory infrastructure management","B. application management","C. information and data management","D. operating system updates"],
    answer: "A", answerText: "A. identity and directory infrastructure management",
    explanation: "In SaaS, Microsoft manages the application, runtime, OS, and hardware. Identity and directory infrastructure is a shared responsibility — Microsoft provides the identity platform (Azure AD) but customers manage their own users, groups, and access policies. Application management, information/data, and OS updates are either purely customer (data) or purely Microsoft (OS/app) responsibilities in SaaS.",
    confidence: "high" },
  { id: 438, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "Where does Azure Monitor store the log and event data it collects?",
    options: ["A. Azure Blob Storage","B. Azure Storage Queue","C. Azure SQL Database","D. a Log Analytics workspace"],
    answer: "D", answerText: "D. a Log Analytics workspace",
    explanation: "Azure Monitor stores log data in a Log Analytics workspace, which is a centralized repository for log data. You can query this data using Kusto Query Language (KQL) via Log Analytics. Metrics data is stored in a separate time-series database within Azure Monitor. Azure Blob Storage and SQL Database are not where Monitor stores its operational logs.",
    confidence: "high" },
  { id: 442, type: "single", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "You need to use Azure Cloud Shell to run a deployment script. Which tool do you use to access Azure Cloud Shell?",
    options: ["A. Azure Resource Manager (ARM)","B. Microsoft Visual Studio","C. Windows command prompt","D. a web browser"],
    answer: "D", answerText: "D. a web browser",
    explanation: "Azure Cloud Shell is a browser-based shell experience accessible from any web browser via portal.azure.com or shell.azure.com. It requires no local installation — you access it through a web browser. ARM is for deployments, Visual Studio is an IDE, and the Windows command prompt is a local terminal with no Cloud Shell access.",
    confidence: "high" },
  { id: 443, type: "multi", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "You need to run a PowerShell script to create Azure resources. On which THREE computers can you run the script?",
    options: ["A. Windows 11 with Azure CLI installed","B. Linux with Azure CLI installed","C. macOS with PowerShell Core 6.0 installed","D. Chrome OS using Azure Cloud Shell","E. Windows 10 with the Azure PowerShell module installed"],
    answer: ["A","D","E"], answerText: "A. Windows 11 with Azure CLI, D. Chrome OS with Azure Cloud Shell, E. Windows 10 with Azure PowerShell module",
    explanation: "Azure Cloud Shell (D) supports PowerShell mode and can run PowerShell scripts from any OS browser. Windows 10/11 with the Azure PowerShell module (A, E) can run PowerShell scripts natively. Azure CLI (B - Linux) uses Bash/command-line syntax, not PowerShell scripts. macOS with PowerShell Core (C) technically can run PowerShell, but this answer reflects the exam's expected correct set.",
    confidence: "medium" },
  { id: 445, type: "multi", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "In the IaaS cloud service model, which TWO components are the responsibility of the cloud provider?",
    options: ["A. configuration and maintenance of storage","B. installation and configuration of the OS","C. maintaining the physical hardware","D. network configuration","E. physical security of the datacenter"],
    answer: ["C","E"], answerText: "C. maintaining the physical hardware, E. physical security of the datacenter",
    explanation: "In IaaS, the cloud provider (Microsoft) is responsible for physical hardware maintenance and physical datacenter security. The customer is responsible for OS installation/patching, application configuration, network configuration (NSGs, VNets), and storage management. The divide is: Microsoft owns the physical layer, customers own everything above the hypervisor.",
    confidence: "high" },
  { id: 450, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "You need to ensure that containers can be created in a storage account named storage1 but NOT deleted from storage1. What should you do?",
    options: [
      "A. Create a ReadOnly lock on storage1",
      "B. Create a delete lock on storage1",
      "C. Enable container soft delete on storage1",
      "D. Enable blob soft delete on storage1"
    ],
    answer: "B", answerText: "B. Create a delete lock on storage1",
    explanation: "A delete lock prevents the resource (and its contents) from being deleted but still allows create and read operations. A ReadOnly lock would also prevent new containers from being created, so it would not meet the requirement of allowing container creation.",
    confidence: "high" },

  { id: 452, type: "multi", topic: "AzureManagement", topicLabel: "Azure Management & Monitoring",
    question: "You need to create an Azure virtual machine from an Android tablet. Which THREE solutions meet the goal?",
    options: [
      "A. Use the Settings app on the Android tablet",
      "B. Use the Azure portal from a browser on the Android tablet",
      "C. Use Bash in Azure Cloud Shell from a browser on the Android tablet",
      "D. Use the PowerApps portal from a browser on the Android tablet",
      "E. Use PowerShell in Azure Cloud Shell from a browser on the Android tablet"
    ],
    answer: ["B","C","E"], answerText: "B. Azure portal, C. Bash in Azure Cloud Shell, E. PowerShell in Azure Cloud Shell",
    explanation: "The Azure portal, Azure Cloud Shell (Bash), and Azure Cloud Shell (PowerShell) are all browser-based tools accessible from any device including an Android tablet. The Settings app has no Azure VM creation capability, and PowerApps is for building low-code apps, not provisioning VMs.",
    confidence: "high" },

  { id: 455, type: "single", topic: "AzureGovernance", topicLabel: "Azure Governance & Compliance",
    question: "Users must NOT be able to delete a resource group named RG1, modify resources in RG1, or delete resources from RG1. What should you do?",
    options: [
      "A. Apply a delete lock to RG1",
      "B. Apply a read-only lock to RG1",
      "C. Grant RBAC permissions to RG1",
      "D. Add a tag to RG1"
    ],
    answer: "B", answerText: "B. Apply a read-only lock to RG1",
    explanation: "A read-only lock prevents all write and delete operations, including modifying or deleting resources and deleting the resource group itself. A delete lock only prevents deletion but still allows modifications. RBAC and tags do not directly prevent modifications.",
    confidence: "high" },

  { id: 457, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "To which cloud service type can you install a custom operating system?",
    options: [
      "A. IaaS only",
      "B. PaaS only",
      "C. SaaS only",
      "D. IaaS and PaaS only",
      "E. PaaS and SaaS only"
    ],
    answer: "A", answerText: "A. IaaS only",
    explanation: "In Infrastructure as a Service (IaaS), you manage the virtual machines including the operating system. With PaaS and SaaS, the underlying OS is managed by the cloud provider — you cannot install or customize the OS yourself.",
    confidence: "high" },

  { id: 467, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "Which of the following correctly orders Azure organizational resources from the highest parent level to the lowest child level?",
    options: [
      "A. Management groups → Subscriptions → Resource groups → Resources",
      "B. Subscriptions → Management groups → Resource groups → Resources",
      "C. Management groups → Resource groups → Subscriptions → Resources",
      "D. Resources → Resource groups → Subscriptions → Management groups"
    ],
    answer: "A", answerText: "A. Management groups → Subscriptions → Resource groups → Resources",
    explanation: "Azure has a four-level hierarchy: Management groups (highest) contain Subscriptions, which contain Resource groups, which contain individual Resources (lowest). This hierarchy allows governance policies to be applied at each level and inherited downward.",
    confidence: "high" },

  { id: 470, type: "single", topic: "AzureCore", topicLabel: "Azure Core Services",
    question: "How many copies of your data does Azure geo-zone-redundant storage (GZRS) maintain?",
    options: [
      "A. 2",
      "B. 3",
      "C. 6",
      "D. 12"
    ],
    answer: "C", answerText: "C. 6",
    explanation: "GZRS combines zone-redundant storage (ZRS) and geo-redundant storage (GRS): it keeps 3 synchronous copies across availability zones in the primary region and 3 additional copies in a secondary geographic region, for a total of 6 copies.",
    confidence: "high" },

  { id: 474, type: "single", topic: "AzureCost", topicLabel: "Azure Cost & SLA",
    question: "Which Azure service makes recommendations to reduce Azure costs?",
    options: [
      "A. Azure Advisor",
      "B. Log Analytics",
      "C. Azure Service Health",
      "D. Azure pricing calculator"
    ],
    answer: "A", answerText: "A. Azure Advisor",
    explanation: "Azure Advisor analyzes your Azure usage and provides personalized best-practice recommendations across five categories: Cost, Security, Reliability, Operational Excellence, and Performance. Log Analytics is for querying log data, Service Health monitors Azure service issues, and the pricing calculator estimates costs before deployment.",
    confidence: "high" },
];

// ─── Topic list ───────────────────────────────────────────────────────────────
const TOPICS = ["All", ...Array.from(new Set(ALL_QUESTIONS.map((q) => q.topicLabel)))];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Question components ───────────────────────────────────────────────────────

function SingleQuestion({ q, userAnswer, onAnswer, showResult }) {
  return (
    <div className="space-y-2">
      {q.options.map((opt) => {
        const letter = opt[0];
        const selected = userAnswer === letter;
        const correct = letter === q.answer;
        let bg = "bg-white border-gray-300";
        if (showResult) {
          if (correct) bg = "bg-green-100 border-green-500";
          else if (selected) bg = "bg-red-100 border-red-400";
        } else if (selected) {
          bg = "bg-blue-50 border-blue-500";
        }
        return (
          <button
            key={letter}
            disabled={showResult}
            onClick={() => onAnswer(letter)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${bg} ${!showResult ? "hover:bg-blue-50 cursor-pointer" : "cursor-default"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function MultiQuestion({ q, userAnswer = [], onAnswer, showResult }) {
  const toggle = (letter) => {
    if (showResult) return;
    const cur = Array.isArray(userAnswer) ? userAnswer : [];
    const next = cur.includes(letter) ? cur.filter((x) => x !== letter) : [...cur, letter];
    onAnswer(next);
  };
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-1">Select {q.answerCount} answers</p>
      {q.options.map((opt) => {
        const letter = opt[0];
        const selected = Array.isArray(userAnswer) && userAnswer.includes(letter);
        const correct = Array.isArray(q.answer) && q.answer.includes(letter);
        let bg = "bg-white border-gray-300";
        if (showResult) {
          if (correct) bg = "bg-green-100 border-green-500";
          else if (selected) bg = "bg-red-100 border-red-400";
        } else if (selected) {
          bg = "bg-blue-50 border-blue-500";
        }
        return (
          <button
            key={letter}
            disabled={showResult}
            onClick={() => toggle(letter)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${bg} ${!showResult ? "hover:bg-blue-50 cursor-pointer" : "cursor-default"}`}
          >
            <span className={`inline-block w-4 h-4 mr-2 border-2 rounded ${selected ? "bg-blue-500 border-blue-500" : "border-gray-400"}`} />
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function YesNoQuestion({ q, userAnswer, onAnswer, showResult }) {
  return (
    <div className="flex gap-4">
      {["Yes", "No"].map((opt) => {
        const selected = userAnswer === opt;
        const correct = opt === q.answer;
        let bg = "bg-white border-gray-300";
        if (showResult) {
          if (correct) bg = "bg-green-100 border-green-500";
          else if (selected) bg = "bg-red-100 border-red-400";
        } else if (selected) {
          bg = "bg-blue-50 border-blue-500";
        }
        return (
          <button
            key={opt}
            disabled={showResult}
            onClick={() => onAnswer(opt)}
            className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-colors ${bg} ${!showResult ? "hover:bg-blue-50 cursor-pointer" : "cursor-default"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function HotspotQuestion({ q, userAnswer = {}, onAnswer, showResult }) {
  const toggle = (idx, val) => {
    if (showResult) return;
    onAnswer({ ...userAnswer, [idx]: val });
  };
  return (
    <div className="space-y-3">
      {q.statements.map((stmt, idx) => {
        const chosen = userAnswer[idx];
        const correct = stmt.answer;
        return (
          <div key={idx} className={`p-3 rounded-lg border-2 ${showResult ? (chosen === correct ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50") : "border-gray-200 bg-gray-50"}`}>
            <p className="text-sm mb-2">{stmt.text}</p>
            <div className="flex gap-2">
              {["Yes", "No"].map((opt) => {
                const sel = chosen === opt;
                let btnCls = "px-4 py-1 rounded border text-sm font-medium ";
                if (showResult) {
                  if (opt === correct) btnCls += "bg-green-500 text-white border-green-600";
                  else if (sel) btnCls += "bg-red-400 text-white border-red-500";
                  else btnCls += "bg-gray-100 text-gray-500 border-gray-300";
                } else {
                  btnCls += sel ? "bg-blue-500 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50";
                }
                return (
                  <button key={opt} disabled={showResult} onClick={() => toggle(idx, opt)} className={btnCls}>{opt}</button>
                );
              })}
              {showResult && chosen !== correct && (
                <span className="text-xs text-red-600 ml-2 self-center">Your answer: {chosen || "—"} | Correct: {correct}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DropdownQuestion({ q, userAnswer = {}, onAnswer, showResult }) {
  const set = (blank, val) => {
    if (showResult) return;
    onAnswer({ ...userAnswer, [blank]: val });
  };
  return (
    <div className="text-base leading-relaxed">
      {q.segments.map((seg, i) => {
        if (seg.text !== undefined) return <span key={i}>{seg.text}</span>;
        const chosen = userAnswer[seg.blank] || "";
        const correct = seg.answer;
        const isCorrect = chosen === correct;
        let selectCls = "mx-1 px-2 py-1 border-2 rounded text-sm ";
        if (showResult) {
          selectCls += isCorrect ? "border-green-500 bg-green-100" : "border-red-400 bg-red-100";
        } else {
          selectCls += chosen ? "border-blue-400 bg-blue-50" : "border-gray-400 bg-white";
        }
        return (
          <span key={i}>
            <select
              disabled={showResult}
              value={chosen}
              onChange={(e) => set(seg.blank, e.target.value)}
              className={selectCls}
            >
              <option value="">-- select --</option>
              {seg.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {showResult && !isCorrect && (
              <span className="text-xs text-green-700 ml-1">(✓ {correct})</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function MatchingQuestion({ q, userAnswer = {}, onAnswer, showResult }) {
  const [selected, setSelected] = useState(null);

  const handleLeft = (left) => {
    if (showResult) return;
    setSelected(left === selected ? null : left);
  };

  const handleRight = (right) => {
    if (showResult || !selected) return;
    onAnswer({ ...userAnswer, [selected]: right });
    setSelected(null);
  };

  const pairs = q.pairs || [];
  const lefts = pairs.map((p) => p.left);
  const rights = pairs.map((p) => p.right);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">Click a left item, then click its matching right item.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {lefts.map((l) => {
            const matched = userAnswer[l];
            const isSelected = selected === l;
            let cls = "p-2 rounded border-2 text-sm cursor-pointer transition-colors ";
            if (showResult) {
              const correctRight = pairs.find((p) => p.left === l)?.right;
              cls += matched === correctRight ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50";
            } else {
              cls += isSelected ? "border-blue-600 bg-blue-100" : matched ? "border-purple-400 bg-purple-50" : "border-gray-300 bg-white hover:border-blue-400";
            }
            return (
              <div key={l} onClick={() => handleLeft(l)} className={cls}>
                <div>{l}</div>
                {matched && !showResult && <div className="text-xs text-purple-600 mt-1">→ {matched}</div>}
                {showResult && <div className={`text-xs mt-1 ${matched === pairs.find((p) => p.left === l)?.right ? "text-green-700" : "text-red-600"}`}>→ {matched || "—"}</div>}
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          {rights.map((r) => {
            const usedBy = Object.entries(userAnswer).find(([, v]) => v === r)?.[0];
            const correctLeft = pairs.find((p) => p.right === r)?.left;
            let cls = "p-2 rounded border-2 text-sm transition-colors ";
            if (showResult) {
              cls += usedBy === correctLeft ? "border-green-500 bg-green-50 cursor-default" : "border-red-400 bg-red-50 cursor-default";
            } else {
              cls += selected ? "cursor-pointer hover:border-blue-400 bg-white border-gray-300" : usedBy ? "border-purple-300 bg-purple-50 cursor-default" : "border-gray-300 bg-white cursor-default";
            }
            return (
              <div key={r} onClick={() => handleRight(r)} className={cls}>{r}</div>
            );
          })}
        </div>
      </div>
      {selected && !showResult && <p className="text-xs text-blue-600 mt-2">Selected: "{selected}" — now click the matching item on the right.</p>}
    </div>
  );
}

function DragDropQuestion({ q, userAnswer = {}, onAnswer, showResult }) {
  const targets = q.targets || [];
  const items = q.items || [];

  const assign = (target, item) => {
    if (showResult) return;
    onAnswer({ ...userAnswer, [target]: item });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 mb-2">Assign each service model to the correct Azure service.</p>
      {targets.map((target) => {
        const chosen = userAnswer[target] || "";
        const correct = q.answer?.[target];
        let border = "border-gray-300";
        if (showResult) border = chosen === correct ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50";
        return (
          <div key={target} className={`flex items-center gap-3 p-2 rounded border-2 ${border}`}>
            <span className="flex-1 text-sm">{target}</span>
            <select
              disabled={showResult}
              value={chosen}
              onChange={(e) => assign(target, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">-- select --</option>
              {items.map((it) => <option key={it} value={it}>{it}</option>)}
            </select>
            {showResult && chosen !== correct && <span className="text-xs text-green-700">✓ {correct}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── isCorrect helper ─────────────────────────────────────────────────────────
function isCorrect(q, ans) {
  if (ans === null || ans === undefined) return false;
  if (q.type === "single" || q.type === "yesno") return ans === q.answer;
  if (q.type === "multi") {
    if (!Array.isArray(ans) || !Array.isArray(q.answer)) return false;
    return [...ans].sort().join() === [...q.answer].sort().join();
  }
  if (q.type === "hotspot") {
    if (typeof ans !== "object") return false;
    return q.statements.every((s, i) => ans[i] === s.answer);
  }
  if (q.type === "dropdown") {
    if (typeof ans !== "object") return false;
    return q.segments.filter((s) => s.blank).every((s) => ans[s.blank] === s.answer);
  }
  if (q.type === "matching") {
    if (typeof ans !== "object") return false;
    return (q.pairs || []).every((p) => ans[p.left] === p.right);
  }
  if (q.type === "dragdrop") {
    if (typeof ans !== "object") return false;
    return (q.targets || []).every((t) => ans[t] === (q.answer || {})[t]);
  }
  return false;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [topic, setTopic] = useState("All");
  const [mode, setMode] = useState("study"); // study | exam
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [flagged, setFlagged] = useState({});

  const filtered = useMemo(() => {
    const base = topic === "All" ? ALL_QUESTIONS : ALL_QUESTIONS.filter((q) => q.topicLabel === topic);
    return base;
  }, [topic]);

  const questions = examStarted ? examQuestions : filtered;
  const q = questions[currentIdx];

  const startExam = () => {
    const pool = topic === "All" ? ALL_QUESTIONS : ALL_QUESTIONS.filter((q2) => q2.topicLabel === topic);
    setExamQuestions(shuffle(pool).slice(0, Math.min(50, pool.length)));
    setCurrentIdx(0);
    setAnswers({});
    setShowResult({});
    setShowSummary(false);
    setExamStarted(true);
    setFlagged({});
  };

  const stopExam = () => {
    setExamStarted(false);
    setShowSummary(false);
    setCurrentIdx(0);
  };

  const handleAnswer = (val) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };

  const check = () => {
    setShowResult((prev) => ({ ...prev, [q.id]: true }));
  };

  const next = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else if (mode === "exam") {
      setShowSummary(true);
    }
  };

  const prev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({ ...prev, [q?.id]: !prev[q?.id] }));
  };

  const answered = answers[q?.id];
  const revealed = showResult[q?.id];
  const correct = q ? isCorrect(q, answered) : false;

  // Exam summary stats
  const examScore = examStarted
    ? examQuestions.reduce((acc, eq) => acc + (isCorrect(eq, answers[eq.id]) ? 1 : 0), 0)
    : 0;

  if (showSummary) {
    const pct = Math.round((examScore / examQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">{pct >= 70 ? "🎉" : "📚"}</div>
          <h2 className="text-2xl font-bold mb-2">Exam Complete!</h2>
          <p className="text-5xl font-extrabold text-blue-600 mb-2">{pct}%</p>
          <p className="text-gray-600 mb-6">{examScore} / {examQuestions.length} correct</p>
          <p className={`text-lg font-semibold mb-6 ${pct >= 70 ? "text-green-600" : "text-red-500"}`}>
            {pct >= 70 ? "✅ Passing Score (≥70%)" : "❌ Below Passing Score"}
          </p>
          <div className="space-y-2 text-left max-h-64 overflow-y-auto mb-6">
            {examQuestions.map((eq, i) => {
              const ok = isCorrect(eq, answers[eq.id]);
              return (
                <div key={eq.id} onClick={() => { setCurrentIdx(i); setShowResult((p) => ({ ...p, [eq.id]: true })); setShowSummary(false); }}
                  className={`p-2 rounded cursor-pointer text-sm ${ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {ok ? "✓" : "✗"} Q{eq.id}: {eq.question.slice(0, 60)}...
                </div>
              );
            })}
          </div>
          <button onClick={stopExam} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
            Back to Study Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-blue-800">AZ-900 Exam Simulator</h1>
            <p className="text-xs text-gray-500">{ALL_QUESTIONS.length} questions</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setCurrentIdx(0); setExamStarted(false); }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              onClick={() => setMode(mode === "study" ? "exam" : "study")}
              className={`px-3 py-1 rounded text-sm font-medium ${mode === "exam" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              {mode === "study" ? "Study" : "Exam"} Mode
            </button>
            {mode === "exam" && !examStarted && (
              <button onClick={startExam} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                Start Exam
              </button>
            )}
            {examStarted && (
              <span className="text-sm font-medium text-blue-700">
                Score: {examScore}/{examQuestions.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {questions.length === 0 && (
          <div className="text-center text-gray-500 mt-20">No questions found for this topic.</div>
        )}
        {q && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="p-6">
              {/* Meta row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {q.topicLabel}
                  </span>
                  {q.confidence === "medium" && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      ⚠ Debated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleFlag} className={`text-lg ${flagged[q.id] ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}>
                    ★
                  </button>
                  <span className="text-sm text-gray-400">
                    {currentIdx + 1} / {questions.length}
                  </span>
                </div>
              </div>

              {/* Question text */}
              <div className="mb-5">
                <p className="font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed">{q.question}</p>
              </div>

              {/* Answer input */}
              <div className="mb-5">
                {q.type === "single" && (
                  <SingleQuestion q={q} userAnswer={answers[q.id]} onAnswer={handleAnswer} showResult={revealed} />
                )}
                {q.type === "multi" && (
                  <MultiQuestion q={q} userAnswer={answers[q.id]} onAnswer={handleAnswer} showResult={revealed} />
                )}
                {q.type === "yesno" && (
                  <YesNoQuestion q={q} userAnswer={answers[q.id]} onAnswer={handleAnswer} showResult={revealed} />
                )}
                {q.type === "hotspot" && (
                  <HotspotQuestion q={q} userAnswer={answers[q.id]} onAnswer={handleAnswer} showResult={revealed} />
                )}
                {q.type === "dropdown" && (
                  <DropdownQuestion q={q} userAnswer={answers[q.id]} onAnswer={handleAnswer} showResult={revealed} />
                )}
                {q.type === "matching" && (
                  <MatchingQuestion q={q} userAnswer={answers[q.id]} onAnswer={handleAnswer} showResult={revealed} />
                )}
                {q.type === "dragdrop" && (
                  <DragDropQuestion q={q} userAnswer={answers[q.id]} onAnswer={handleAnswer} showResult={revealed} />
                )}
              </div>

              {/* Result feedback */}
              {revealed && (
                <div className={`mb-4 p-4 rounded-xl border-l-4 ${correct ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50"}`}>
                  <p className={`font-bold mb-1 ${correct ? "text-green-700" : "text-red-600"}`}>
                    {correct ? "✅ Correct!" : "❌ Incorrect"}
                  </p>
                  {!correct && q.answerText && (
                    <p className="text-sm font-medium text-gray-700 mb-1">Correct answer: {q.answerText}</p>
                  )}
                  <p className="text-sm text-gray-600">{q.explanation}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={prev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-40 text-sm font-medium"
                >
                  ← Prev
                </button>
                <div className="flex gap-2">
                  {mode === "study" && !revealed && (
                    <button
                      onClick={check}
                      disabled={answered === undefined || answered === null}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 text-sm font-medium"
                    >
                      Check Answer
                    </button>
                  )}
                  {(revealed || mode === "exam") && (
                    <button
                      onClick={next}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                      {currentIdx < questions.length - 1 ? "Next →" : mode === "exam" ? "Finish Exam" : "Done"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flagged list */}
        {Object.values(flagged).some(Boolean) && (
          <div className="mt-4 bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-2">⭐ Flagged Questions</h3>
            <div className="flex flex-wrap gap-2">
              {questions.map((fq, i) => flagged[fq.id] ? (
                <button key={fq.id} onClick={() => setCurrentIdx(i)}
                  className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200">
                  Q{fq.id}
                </button>
              ) : null)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
