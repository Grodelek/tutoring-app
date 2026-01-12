package com.tutoring.app;

import com.tutoring.app.domain.User;
import com.tutoring.app.repository.UserRepository;
import com.tutoring.app.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
class AppApplicationTests {



	@Test
	void contextLoads() {
	}

}
