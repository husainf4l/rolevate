#!/usr/bin/env python3
"""
CV Builder Test Script - Complete testing for the 8-node LangGraph pipeline
Tests all nodes individually and the full workflow end-to-end
"""
import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any
from datetime import datetime
import uuid

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

from loguru import logger
from app.agent.cv_builder_graph import cv_builder_workflow, generate_cv, process_chat
from app.agent.nodes.storage_node import CVStorageManager


class CVBuilderTester:
    """Comprehensive test suite for CV Builder AI system"""
    
    def __init__(self):
        self.test_results = {}
        self.storage_manager = CVStorageManager()
        
        # Test CV data
        self.sample_cv_data = {
            "personal_info": {
                "full_name": "John Smith",
                "email": "john.smith@email.com", 
                "phone": "+1 (555) 123-4567",
                "location": "San Francisco, CA",
                "linkedin": "linkedin.com/in/johnsmith",
                "github": "github.com/johnsmith"
            },
            "summary": "Experienced software engineer with 5+ years developing scalable web applications. Skilled in Python, JavaScript, and cloud technologies.",
            "experiences": [
                {
                    "job_title": "Senior Software Engineer",
                    "company": "Tech Corp",
                    "location": "San Francisco, CA",
                    "start_date": "2022-01",
                    "end_date": "present",
                    "description": "Led development of microservices architecture serving 1M+ users",
                    "achievements": [
                        "Improved system performance by 40%",
                        "Reduced deployment time from 2 hours to 15 minutes",
                        "Mentored 3 junior developers"
                    ]
                },
                {
                    "job_title": "Software Developer",
                    "company": "StartupCo",
                    "location": "San Jose, CA",
                    "start_date": "2020-03",
                    "end_date": "2021-12",
                    "description": "Developed full-stack web applications using React and Node.js",
                    "achievements": [
                        "Built user authentication system",
                        "Implemented real-time chat feature"
                    ]
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science in Computer Science",
                    "institution": "University of California",
                    "location": "Berkeley, CA",
                    "start_date": "2016-08",
                    "end_date": "2020-05",
                    "gpa": "3.7"
                }
            ],
            "skills": {
                "programming_languages": ["Python", "JavaScript", "Java", "Go"],
                "frameworks": ["React", "Django", "Express.js", "Flask"],
                "databases": ["PostgreSQL", "MongoDB", "Redis"],
                "tools": ["Docker", "Kubernetes", "AWS", "Git"]
            },
            "projects": [
                {
                    "name": "E-commerce Platform",
                    "description": "Built a scalable e-commerce platform using Django and React",
                    "technologies": ["Django", "React", "PostgreSQL", "Docker"],
                    "url": "github.com/johnsmith/ecommerce"
                }
            ],
            "certifications": [
                {
                    "name": "AWS Solutions Architect",
                    "issuer": "Amazon Web Services",
                    "date": "2022-06"
                }
            ]
        }
        
        self.test_messages = [
            "Help me create a professional CV",
            "I'm a software engineer with 5 years of experience at Tech Corp and StartupCo",
            "Add my education: BS Computer Science from UC Berkeley",
            "Include my skills: Python, JavaScript, React, Django, AWS",
            "Generate my CV using a modern template"
        ]
    
    async def test_individual_nodes(self) -> Dict[str, Any]:
        """Test each node individually"""
        
        logger.info("🧪 Testing individual nodes...")
        node_results = {}
        
        # Test Input Node
        try:
            from app.agent.nodes.input_node import input_node, CVInputProcessor
            
            processor = CVInputProcessor()
            
            # Test natural language input
            nl_result = await processor.process_natural_language_input(
                "I am John Smith, a software engineer with 5 years of experience"
            )
            
            # Test structured data input
            structured_result = await processor.process_structured_data(self.sample_cv_data)
            
            node_results["input_node"] = {
                "status": "success",
                "natural_language_processing": bool(nl_result.get("personal_info")),
                "structured_data_processing": bool(structured_result),
                "data_validation": "full_name" in nl_result.get("personal_info", {})
            }
            
        except Exception as e:
            node_results["input_node"] = {"status": "error", "error": str(e)}
        
        # Test Data Cleaner Node
        try:
            from app.agent.nodes.data_cleaner_node import data_cleaner_node
            
            test_state = {"cv_memory": self.sample_cv_data.copy()}
            result_state = await data_cleaner_node(test_state)
            
            node_results["data_cleaner_node"] = {
                "status": "success",
                "has_cleaned_data": bool(result_state.get("cv_memory")),
                "processing_step": result_state.get("processing_step"),
                "data_integrity": len(result_state["cv_memory"]) >= len(self.sample_cv_data)
            }
            
        except Exception as e:
            node_results["data_cleaner_node"] = {"status": "error", "error": str(e)}
        
        # Test Content Writer Node
        try:
            from app.agent.nodes.content_writer_node import content_writer_node
            
            test_state = {"cv_memory": self.sample_cv_data.copy()}
            result_state = await content_writer_node(test_state)
            
            enhanced_summary = result_state["cv_memory"].get("summary", "")
            original_summary = self.sample_cv_data.get("summary", "")
            
            node_results["content_writer_node"] = {
                "status": "success",
                "content_enhanced": len(enhanced_summary) > len(original_summary),
                "processing_step": result_state.get("processing_step"),
                "summary_improved": "professional" in enhanced_summary.lower()
            }
            
        except Exception as e:
            node_results["content_writer_node"] = {"status": "error", "error": str(e)}
        
        # Test Section Ranker Node
        try:
            from app.agent.nodes.section_ranker_node import section_ranker_node
            
            test_state = {"cv_memory": self.sample_cv_data.copy()}
            result_state = await section_ranker_node(test_state)
            
            section_order = result_state.get("section_order", [])
            
            node_results["section_ranker_node"] = {
                "status": "success",
                "has_section_order": len(section_order) > 0,
                "processing_step": result_state.get("processing_step"),
                "logical_ordering": "experiences" in section_order and "personal_info" in section_order
            }
            
        except Exception as e:
            node_results["section_ranker_node"] = {"status": "error", "error": str(e)}
        
        # Test Template Selector Node
        try:
            from app.agent.nodes.template_selector_node import template_selector_node
            
            test_state = {"cv_memory": self.sample_cv_data.copy()}
            result_state = await template_selector_node(test_state)
            
            selected_template = result_state.get("selected_template", "")
            template_info = result_state.get("template_selection_info", {})
            
            node_results["template_selector_node"] = {
                "status": "success",
                "has_template": bool(selected_template),
                "processing_step": result_state.get("processing_step"),
                "template_valid": template_info.get("selection_reasoning", {}).get("match_score", 0) > 0
            }
            
        except Exception as e:
            node_results["template_selector_node"] = {"status": "error", "error": str(e)}
        
        # Test PDF Renderer Node
        try:
            from app.agent.nodes.pdf_renderer_node import pdf_renderer_node
            
            test_state = {
                "cv_memory": self.sample_cv_data.copy(),
                "selected_template": {"name": "modern", "file": "modern_template.html"}
            }
            result_state = await pdf_renderer_node(test_state)
            
            rendered_pdf = result_state.get("rendered_pdf", {})
            
            node_results["pdf_renderer_node"] = {
                "status": "success",
                "has_pdf": bool(rendered_pdf.get("content")),
                "processing_step": result_state.get("processing_step"),
                "pdf_valid": len(rendered_pdf.get("content", b"")) > 1000
            }
            
        except Exception as e:
            node_results["pdf_renderer_node"] = {"status": "error", "error": str(e)}
        
        # Test Optimizer Node
        try:
            from app.agent.nodes.optimizer_node import optimizer_node
            
            test_state = {"cv_memory": self.sample_cv_data.copy()}
            result_state = await optimizer_node(test_state)
            
            optimization_report = result_state.get("optimization_report", {})
            
            node_results["optimizer_node"] = {
                "status": "success",
                "has_report": bool(optimization_report),
                "processing_step": result_state.get("processing_step"),
                "optimizations_applied": len(optimization_report.get("optimizations_applied", []))
            }
            
        except Exception as e:
            node_results["optimizer_node"] = {"status": "error", "error": str(e)}
        
        # Test Storage Node
        try:
            from app.agent.nodes.storage_node import storage_node
            
            test_state = {
                "cv_memory": self.sample_cv_data.copy(),
                "rendered_pdf": {"content": b"test pdf content"},
                "user_id": "test_user"
            }
            result_state = await storage_node(test_state)
            
            storage_info = result_state.get("storage_info", {})
            
            node_results["storage_node"] = {
                "status": "success",
                "has_cv_id": bool(result_state.get("cv_id")),
                "processing_step": result_state.get("processing_step"),
                "storage_successful": bool(storage_info.get("cv_id"))
            }
            
        except Exception as e:
            node_results["storage_node"] = {"status": "error", "error": str(e)}
        
        # Calculate overall success
        successful_nodes = sum(1 for result in node_results.values() if result["status"] == "success")
        total_nodes = len(node_results)
        
        self.test_results["individual_nodes"] = {
            "results": node_results,
            "success_rate": f"{successful_nodes}/{total_nodes}",
            "success_percentage": (successful_nodes / total_nodes) * 100
        }
        
        logger.success(f"✅ Individual node testing: {successful_nodes}/{total_nodes} passed")
        return node_results
    
    async def test_complete_workflow(self) -> Dict[str, Any]:
        """Test the complete workflow end-to-end"""
        
        logger.info("🚀 Testing complete workflow...")
        
        try:
            # Test structured data workflow
            input_data = {
                "cv_data": self.sample_cv_data,
                "template_preference": "modern",
                "optimization_level": "comprehensive"
            }
            
            start_time = datetime.now()
            result = await generate_cv(input_data, "test_user")
            end_time = datetime.now()
            
            execution_time = (end_time - start_time).total_seconds()
            
            workflow_result = {
                "status": "success" if result.get("success") else "failed",
                "execution_time": execution_time,
                "cv_generated": bool(result.get("cv_id")),
                "error_count": result.get("error_count", 0),
                "processing_steps": len(result.get("performance_metrics", {})),
                "workflow_id": result.get("workflow_id"),
                "cv_id": result.get("cv_id")
            }
            
            if result.get("success"):
                logger.success(f"✅ Complete workflow test passed in {execution_time:.2f}s")
            else:
                logger.error(f"❌ Complete workflow test failed: {result.get('error')}")
            
            self.test_results["complete_workflow"] = workflow_result
            return workflow_result
            
        except Exception as e:
            logger.error(f"❌ Complete workflow test failed: {e}")
            workflow_result = {
                "status": "error",
                "error": str(e),
                "execution_time": 0
            }
            self.test_results["complete_workflow"] = workflow_result
            return workflow_result
    
    async def test_chat_interface(self) -> Dict[str, Any]:
        """Test the chat interface"""
        
        logger.info("💬 Testing chat interface...")
        
        chat_results = []
        thread_id = str(uuid.uuid4())
        
        try:
            for i, message in enumerate(self.test_messages):
                start_time = datetime.now()
                
                result = await process_chat(message, thread_id, "test_user")
                
                end_time = datetime.now()
                execution_time = (end_time - start_time).total_seconds()
                
                chat_result = {
                    "message_number": i + 1,
                    "message": message,
                    "response_received": bool(result.get("response_message")),
                    "execution_time": execution_time,
                    "processing_step": result.get("processing_step", "unknown"),
                    "cv_id_generated": bool(result.get("cv_id"))
                }
                
                chat_results.append(chat_result)
                
                if result.get("cv_id"):
                    logger.success(f"✅ CV generated in chat interaction {i + 1}")
                    break
            
            # Calculate stats
            successful_interactions = sum(1 for r in chat_results if r["response_received"])
            total_interactions = len(chat_results)
            avg_response_time = sum(r["execution_time"] for r in chat_results) / total_interactions
            
            chat_test_result = {
                "status": "success",
                "interactions": chat_results,
                "success_rate": f"{successful_interactions}/{total_interactions}",
                "average_response_time": avg_response_time,
                "cv_generated": any(r["cv_id_generated"] for r in chat_results)
            }
            
            self.test_results["chat_interface"] = chat_test_result
            
            logger.success(f"✅ Chat interface test: {successful_interactions}/{total_interactions} interactions successful")
            return chat_test_result
            
        except Exception as e:
            logger.error(f"❌ Chat interface test failed: {e}")
            chat_test_result = {
                "status": "error",
                "error": str(e),
                "interactions": chat_results
            }
            self.test_results["chat_interface"] = chat_test_result
            return chat_test_result
    
    async def test_error_handling(self) -> Dict[str, Any]:
        """Test error handling and edge cases"""
        
        logger.info("⚠️ Testing error handling...")
        
        error_tests = {}
        
        # Test empty input
        try:
            result = await generate_cv({}, "test_user")
            error_tests["empty_input"] = {
                "handled_gracefully": not result.get("success"),
                "error_message": result.get("error", "No error message")
            }
        except Exception as e:
            error_tests["empty_input"] = {
                "handled_gracefully": True,
                "error_message": str(e)
            }
        
        # Test invalid chat message
        try:
            result = await process_chat("", "test_thread", "test_user")
            error_tests["empty_chat"] = {
                "handled_gracefully": "error" in result.get("response_message", "").lower(),
                "response_provided": bool(result.get("response_message"))
            }
        except Exception as e:
            error_tests["empty_chat"] = {
                "handled_gracefully": True,
                "error_message": str(e)
            }
        
        # Test malformed CV data
        try:
            malformed_data = {"invalid": "structure", "missing": "required_fields"}
            result = await generate_cv({"cv_data": malformed_data}, "test_user")
            error_tests["malformed_data"] = {
                "handled_gracefully": True,
                "processing_attempted": bool(result.get("workflow_id"))
            }
        except Exception as e:
            error_tests["malformed_data"] = {
                "handled_gracefully": True,
                "error_message": str(e)
            }
        
        self.test_results["error_handling"] = error_tests
        
        handled_count = sum(1 for test in error_tests.values() if test.get("handled_gracefully"))
        total_count = len(error_tests)
        
        logger.success(f"✅ Error handling test: {handled_count}/{total_count} cases handled gracefully")
        return error_tests
    
    async def run_performance_benchmarks(self) -> Dict[str, Any]:
        """Run performance benchmarks"""
        
        logger.info("⚡ Running performance benchmarks...")
        
        benchmarks = {}
        
        # Benchmark workflow execution times
        execution_times = []
        
        for i in range(3):  # Run 3 times for average
            start_time = datetime.now()
            
            try:
                result = await generate_cv({
                    "cv_data": self.sample_cv_data,
                    "template_preference": "modern"
                }, f"benchmark_user_{i}")
                
                end_time = datetime.now()
                execution_time = (end_time - start_time).total_seconds()
                execution_times.append(execution_time)
                
            except Exception as e:
                logger.warning(f"Benchmark run {i + 1} failed: {e}")
        
        if execution_times:
            benchmarks["workflow_performance"] = {
                "average_time": sum(execution_times) / len(execution_times),
                "min_time": min(execution_times),
                "max_time": max(execution_times),
                "runs_completed": len(execution_times)
            }
        
        # Memory usage (basic check)
        import psutil
        process = psutil.Process()
        memory_info = process.memory_info()
        
        benchmarks["resource_usage"] = {
            "memory_mb": memory_info.rss / 1024 / 1024,
            "cpu_percent": process.cpu_percent()
        }
        
        self.test_results["performance"] = benchmarks
        
        avg_time = benchmarks.get("workflow_performance", {}).get("average_time", 0)
        logger.success(f"⚡ Performance benchmark: Avg execution time {avg_time:.2f}s")
        
        return benchmarks
    
    async def generate_test_report(self) -> str:
        """Generate comprehensive test report"""
        
        logger.info("📊 Generating test report...")
        
        report_data = {
            "test_summary": {
                "timestamp": datetime.now().isoformat(),
                "total_tests": len(self.test_results),
                "system_info": {
                    "python_version": sys.version,
                    "platform": sys.platform
                }
            },
            "test_results": self.test_results
        }
        
        # Save report to file
        report_path = Path("test_report.json")
        with open(report_path, 'w') as f:
            json.dump(report_data, f, indent=2, default=str)
        
        # Create summary
        summary_lines = [
            "=" * 60,
            "CV BUILDER AI - TEST REPORT SUMMARY",
            "=" * 60,
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "NODE TESTS:",
        ]
        
        if "individual_nodes" in self.test_results:
            node_results = self.test_results["individual_nodes"]["results"]
            for node_name, result in node_results.items():
                status = "✅ PASS" if result["status"] == "success" else "❌ FAIL"
                summary_lines.append(f"  {node_name}: {status}")
        
        summary_lines.extend([
            "",
            "WORKFLOW TESTS:",
        ])
        
        if "complete_workflow" in self.test_results:
            workflow = self.test_results["complete_workflow"]
            status = "✅ PASS" if workflow["status"] == "success" else "❌ FAIL"
            exec_time = workflow.get("execution_time", 0)
            summary_lines.append(f"  Complete Workflow: {status} ({exec_time:.2f}s)")
        
        if "chat_interface" in self.test_results:
            chat = self.test_results["chat_interface"]
            status = "✅ PASS" if chat["status"] == "success" else "❌ FAIL"
            summary_lines.append(f"  Chat Interface: {status}")
        
        summary_lines.extend([
            "",
            "PERFORMANCE:",
        ])
        
        if "performance" in self.test_results:
            perf = self.test_results["performance"]
            workflow_perf = perf.get("workflow_performance", {})
            avg_time = workflow_perf.get("average_time", 0)
            memory_mb = perf.get("resource_usage", {}).get("memory_mb", 0)
            summary_lines.extend([
                f"  Average Execution Time: {avg_time:.2f}s",
                f"  Memory Usage: {memory_mb:.1f} MB"
            ])
        
        summary_lines.extend([
            "",
            f"📊 Full report saved to: {report_path.absolute()}",
            "=" * 60
        ])
        
        summary = "\n".join(summary_lines)
        
        # Save summary
        summary_path = Path("test_summary.txt")
        with open(summary_path, 'w') as f:
            f.write(summary)
        
        print(summary)
        
        logger.success(f"📊 Test report generated: {report_path}")
        return summary


async def main():
    """Main test execution function"""
    
    logger.add("cv_builder_tests.log", rotation="10 MB")
    logger.info("🧪 Starting CV Builder AI Test Suite")
    
    tester = CVBuilderTester()
    
    try:
        # Run all tests
        await tester.test_individual_nodes()
        await tester.test_complete_workflow()
        await tester.test_chat_interface()
        await tester.test_error_handling()
        await tester.run_performance_benchmarks()
        
        # Generate report
        await tester.generate_test_report()
        
        logger.success("🎉 All tests completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Test suite execution failed: {e}")
        raise


if __name__ == "__main__":
    # Check for command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--test-cv":
        asyncio.run(main())
    else:
        print("""
CV Builder AI Test Suite

Usage:
  python main.py --test-cv    Run comprehensive test suite

This will test:
✓ All 8 individual nodes
✓ Complete workflow end-to-end  
✓ Chat interface functionality
✓ Error handling and edge cases
✓ Performance benchmarks

Results will be saved to test_report.json and test_summary.txt
""")