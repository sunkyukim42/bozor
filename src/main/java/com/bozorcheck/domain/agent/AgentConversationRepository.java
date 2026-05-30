package com.bozorcheck.domain.agent;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentConversationRepository extends JpaRepository<AgentConversation, UUID> {
}
