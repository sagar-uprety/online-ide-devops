package edu.tum.cit.sse.compiler.services;

import edu.tum.cit.sse.compiler.models.SourceCodeDto;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;

import static org.assertj.core.api.BDDAssertions.then;


@RunWith(SpringRunner.class)
public class CompilerServiceTest {
    @Autowired
    private CompilerService systemUnderTest;

    private String javaCode;
    private String cCode;

    @Before
    public void setUp() throws Exception {
        javaCode = "public class App {\n" +
                "\n" +
                "\tpublic static void main(String[] args) {\n" +
                "\t\tSystem.out.println(\"Hello, World\");\n" +
                "\t}\n" +
                "\n" +
                "}";
        cCode = "#include <stdio.h>\n" +
                "\n" +
                "int main (void) {\n" +
                "\tprintf(\"Hello, World\\n\");\n" +
                "}\n";
    }

    @Test
    public void should_compile_java_code() throws IOException {
        // given
        SourceCodeDto javaSourceCodeDto = new SourceCodeDto();
        javaSourceCodeDto.setCode(javaCode);
        javaSourceCodeDto.setFileName("App.java");

        // when
        SourceCodeDto sourceCodeDto = systemUnderTest.compile(javaSourceCodeDto);

        // then
        then(sourceCodeDto.isCompilable())
                .isTrue();
        then(sourceCodeDto.getStdout())
                .isEqualTo("");
    }

    @Test
    public void should_not_compile_faulty_java_code() throws IOException {
        // given
        SourceCodeDto javaSourceCodeDto = new SourceCodeDto();
        javaSourceCodeDto.setCode(javaCode.substring(1, javaCode.length()));
        javaSourceCodeDto.setFileName("App.java");

        // when
        SourceCodeDto sourceCodeDto = systemUnderTest.compile(javaSourceCodeDto);

        // then
        then(sourceCodeDto.isCompilable())
                .isFalse();
        then(sourceCodeDto.getStdout())
                .isEqualTo("");
    }

//    @Test
//    public void should_compile_c_code() throws IOException {
//        // given
//        SourceCodeDto cSourceCodeDto = new SourceCodeDto();
//        cSourceCodeDto.setCode(cCode);
//        cSourceCodeDto.setFileName("main.c");
//
//        // when
//        SourceCodeDto sourceCodeDto = systemUnderTest.compile(cSourceCodeDto);
//
//        // then
//        then(sourceCodeDto.isCompilable())
//                .isTrue();
//        then(sourceCodeDto.getStdout())
//                .isEqualTo("");
//    }
//
//    @Test
//    public void should_not_compile_faulty_c_code() throws IOException {
//        // given
//        SourceCodeDto cSourceCodeDto = new SourceCodeDto();
//        cSourceCodeDto.setCode(cCode.substring(1, cCode.length()));
//        cSourceCodeDto.setFileName("main.c");
//
//        // when
//        SourceCodeDto sourceCodeDto = systemUnderTest.compile(cSourceCodeDto);
//
//        // then
//        then(sourceCodeDto.isCompilable())
//                .isFalse();
//        then(sourceCodeDto.getStdout())
//                .isEqualTo("");
//    }

    @TestConfiguration
    static class CompilerServiceTestConfiguration {

        @Bean
        public CompilerService systemUnderTest() {
            return new CompilerService();
        }
    }
}
